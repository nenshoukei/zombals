import { uuidv7 } from 'uuidv7';
import { getGamePlayer, saveGameRecord } from './db';
import { CLIENT_VERSION } from '@/config/client_version';
import { ACCEPT_TIMEOUT_MS, MATCHING_TIMEOUT_MS } from '@/config/common';
import { GameServerMain } from '@/game/game_server_main';
import { logger, Logger } from '@/logger';
import {
  GameActionResponse,
  GameCommand,
  GamePlayer,
  GameRecordId,
  GameStartResponse,
  GameWaitingResponse,
  getCurrentTime,
  getFutureTime,
  LEADERS,
  LobbyEnterRequest,
  RequestDeniedReason,
  RequestDeniedResponse,
  Timestamp,
  UserId,
  ZombalsResponse,
} from '@/types';

export interface LobbyWaitingPlayer {
  /** 待ち受けプレイヤー */
  player: GamePlayer;
  /** パスコード (同じパスコード同士でないとマッチングしない) */
  passCode?: string;
  /** 待ち受けタイムアウト時間 (エポックミリ秒) */
  waitUntil: Timestamp;
  /** タイマー */
  timer: NodeJS.Timeout;
}

export interface LobbyWaitingGame {
  /** ゲーム記録ID (仮決め) */
  gameRecordId: GameRecordId;
  /** ゲーム参加者 */
  players: [GamePlayer, GamePlayer];
  /** マッチング承諾状況 */
  accepted: [boolean, boolean];
  /** 承諾タイムアウト時間 (エポックミリ秒) */
  waitUntil: Timestamp;
  /** タイマー */
  timer: NodeJS.Timeout;
}

export interface UserSender {
  sendToUser(userId: UserId, response: ZombalsResponse): void;
}

export class Lobby {
  /** 待っているプレイヤーの Map (キーはユーザーID) */
  waitingPlayerMap: Map<UserId, LobbyWaitingPlayer>;
  /** マッチしたユーザーIDとゲーム記録IDの Map */
  matchedMap: Map<UserId, GameRecordId>;
  /** IDだけ仮決めされてまだ開始前のゲーム (2人目が受諾したらゲーム開始) */
  waitingGameMap: Map<GameRecordId, LobbyWaitingGame>;
  /** 進行中のゲーム */
  ongoingGameMap: Map<GameRecordId, GameServerMain>;
  /** ロガー */
  logger: Logger;

  constructor(private userSender: UserSender) {
    this.waitingPlayerMap = new Map();
    this.matchedMap = new Map();
    this.waitingGameMap = new Map();
    this.ongoingGameMap = new Map();
    this.logger = logger.child({ tag: 'lobby' });
  }

  private sendToUser(userId: UserId, response: ZombalsResponse): void {
    this.userSender.sendToUser(userId, response);
  }

  private maintenanceModeResponse(): RequestDeniedResponse | null {
    // メンテナンスモード中
    if (process.env.MAINTENANCE_MODE) {
      return {
        type: 'DENIED',
        reason: RequestDeniedReason.MAINTENANCE,
        message: { ja: 'ただいまシステムのメンテナンス中です。' },
      };
    }
    return null;
  }

  /**
   * プレイヤーをロビーに入室させる（マッチング開始）
   *
   * @param userId ユーザーID
   * @param req リクエスト
   */
  async playerEnter(userId: UserId, req: LobbyEnterRequest): Promise<void> {
    // メンテナンスモード中
    const maintenance = this.maintenanceModeResponse();
    if (maintenance) return this.sendToUser(userId, maintenance);

    // クライアントのバージョンチェック
    if (req.clientVersion !== CLIENT_VERSION) {
      return this.sendToUser(userId, {
        type: 'DENIED',
        reason: RequestDeniedReason.VERSION_MISMATCH,
        message: { ja: 'アプリのバージョンが古くなっています。画面を更新してください。' },
      });
    }

    // 既にマッチングしていないか確認
    const gameRecordId = this.matchedMap.get(userId);
    if (gameRecordId) {
      // 開始前または進行中のゲームかどうか確認
      const response = await this.getResponseForOngoingGame(userId, gameRecordId);
      if (response) {
        return this.sendToUser(userId, response);
      }

      // 終了済みゲームだったので続行
      this.matchedMap.delete(userId);
    }

    // 既に待機列に並んでいるか確認
    let waiting = this.waitingPlayerMap.get(userId);
    if (waiting) {
      const isExpired = Boolean(waiting && waiting.waitUntil <= getCurrentTime());
      if (!waiting || isExpired) {
        // タイムアウト済み
        return this.sendToUser(userId, {
          type: 'DENIED',
          reason: RequestDeniedReason.EXPIRED,
          message: { ja: 'マッチングがタイムアウトしました。' },
        });
      }
    } else {
      // プレイヤー情報とデッキ情報を取得して新しく並ぶ
      try {
        const player = await getGamePlayer(userId, req.deckId);
        const timer = setTimeout(() => this.timeoutMatching(userId), MATCHING_TIMEOUT_MS);
        waiting = {
          player,
          passCode: req.passCode,
          waitUntil: getFutureTime(MATCHING_TIMEOUT_MS),
          timer,
        };
      } catch (e) {
        // デッキが見つからない
        return this.sendToUser(userId, {
          type: 'DENIED',
          reason: RequestDeniedReason.FORBIDDEN,
          message: { ja: '対象のデッキが見つかりませんでした' },
        });
      }
      this.waitingPlayerMap.set(userId, waiting);
      this.matchedMap.delete(userId);

      this.logger.debug({ userId, deckId: req.deckId, passCode: req.passCode }, 'User start matching');
    }

    setImmediate(() => this.makeNextMatch());

    this.sendToUser(userId, {
      type: 'LOBBY_WAITING',
      waitUntil: waiting.waitUntil,
    });
  }

  private timeoutMatching(userId: UserId): void {
    const waiting = this.waitingPlayerMap.get(userId);
    if (waiting) {
      clearTimeout(waiting.timer);
      this.waitingPlayerMap.delete(userId);
      this.logger.debug({ userId }, 'User timeout matching');

      this.sendToUser(waiting.player.userId, {
        type: 'DENIED',
        reason: RequestDeniedReason.EXPIRED,
        message: { ja: 'マッチングがタイムアウトしました。' },
      });
    }
  }

  /**
   * プレイヤーをロビーから退室させる
   *
   * @param userId ユーザーID
   */
  async playerLeave(userId: UserId): Promise<void> {
    const waiting = this.waitingPlayerMap.get(userId);
    if (waiting) {
      // マッチング待ちを解除
      clearTimeout(waiting.timer);
      this.waitingPlayerMap.delete(userId);
      this.logger.debug({ userId }, 'User leave from matching');
    }

    const gameRecordId = this.matchedMap.get(userId);
    if (gameRecordId) {
      this.matchedMap.delete(userId);

      // マッチング不成立として開始前ゲームは削除
      const waitingGame = this.waitingGameMap.get(gameRecordId);
      if (waitingGame) {
        clearTimeout(waitingGame.timer);
        this.waitingGameMap.delete(gameRecordId);
        this.logger.debug({ userId, gameRecordId }, 'User leave from waiting game');
      }

      // 進行中のゲームがあったら退室 = 投了扱いとする
      const ongoingGame = this.ongoingGameMap.get(gameRecordId);
      if (ongoingGame) {
        // プレイヤーの退室をゲーム内にも反映
        ongoingGame.userLeave(userId);
        this.logger.debug({ userId, gameRecordId }, 'User leave from ongoing game');
      }
    }
  }

  /**
   * プレイヤーがマッチングを受諾した
   */
  async playerStartGame(userId: UserId): Promise<void> {
    // メンテナンスモード中
    const maintenance = this.maintenanceModeResponse();
    if (maintenance) return this.sendToUser(userId, maintenance);

    // マッチ済みゲーム記録ID
    const gameRecordId = this.matchedMap.get(userId);
    if (!gameRecordId) {
      // マッチしていない
      return this.sendToUser(userId, {
        type: 'DENIED',
        reason: RequestDeniedReason.NO_GAME,
        message: { ja: '試合開始に失敗しました。（不正な試合ID）' },
      });
    }

    // 開始前または進行中のゲームがないか確認
    const response = await this.getResponseForOngoingGame(userId, gameRecordId);
    if (!response) {
      // 該当のゲームなし (どちらかが LEAVE してしまったか終了済み)
      return this.sendToUser(userId, {
        type: 'DENIED',
        reason: RequestDeniedReason.NO_GAME,
        message: { ja: '試合開始に失敗しました。（相手が接続不良？）' },
      });
    }
    if (response.type !== 'GAME_WAITING') {
      return this.sendToUser(userId, response);
    }

    // 開始前のゲームだったら承諾済みにする
    const waitingGame = this.waitingGameMap.get(gameRecordId)!;
    const playerIndex = waitingGame.players[0].userId === userId ? 0 : 1;
    if (!waitingGame.accepted[playerIndex]) {
      waitingGame.accepted[playerIndex] = true;
      this.logger.debug({ userId, gameRecordId }, `User accepted game (index:${playerIndex})`);
    }

    // 2人とも承諾したのでゲームを開始
    if (waitingGame.accepted[0] && waitingGame.accepted[1]) {
      clearTimeout(waitingGame.timer);
      this.waitingGameMap.delete(gameRecordId);
      this.logger.debug({ gameRecordId }, 'Game start');

      // ゲームを作成
      const game = this.createNewGame(waitingGame);
      this.ongoingGameMap.set(gameRecordId, game);

      const startResponse: GameStartResponse = {
        type: 'GAME_START',
        userIds: {
          AL: game.record.players.AL.userId,
          BL: game.record.players.BL.userId,
        },
      };

      // ゲーム参加者両方に GAME_START を送る
      waitingGame.players.forEach((player) => {
        this.sendToUser(player.userId, startResponse);
      });

      // ゲーム開始
      game.startGame();
    }
  }

  private createNewGame(waitingGame: LobbyWaitingGame): GameServerMain {
    const game = new GameServerMain(waitingGame.gameRecordId, waitingGame.players);

    // アクションが発生したらユーザーに送信
    const userIds = waitingGame.players.map((p) => p.userId);
    game.onAction.on((event) => {
      userIds.forEach((userId, index) => {
        const position = LEADERS[index];
        const sendAction = game.filterActionForPlayer(event.action, position);

        const response: GameActionResponse = {
          type: 'GAME_ACTION',
          actions: [sendAction],
          fromIndex: event.index,
        };

        this.sendToUser(userId, response);
      });
    });

    return game;
  }

  async playerGameCommand(userId: UserId, command: GameCommand): Promise<void> {
    const game = this.getGameForUserId(userId);
    if (!game) {
      return this.sendToUser(userId, {
        type: 'DENIED',
        reason: RequestDeniedReason.NO_GAME,
        commandId: command.id,
        message: { ja: '参加している試合が見つかりませんでした。' },
      });
    }
    if (game.isFinished) {
      return this.sendToUser(userId, {
        type: 'DENIED',
        reason: RequestDeniedReason.GAME_ENDED,
        commandId: command.id,
        message: { ja: '試合がすでに終了しています。' },
      });
    }

    // コマンドを処理
    game.receiveGameCommand(userId, command);

    if (game.isFinished) {
      // ゲームが終了していたら終了処理
      this.gameEnd(game);
    } else {
      // ゲームが終了していなければアクティブプレイヤーのコマンド受付状態とする
      this.sendToUser(game.getActivePlayerId(), { type: 'READY' });
    }
  }

  /**
   * ユーザーIDに対して進行中のゲームを返す
   */
  private getGameForUserId(userId: UserId): GameServerMain | null {
    const gameRecordId = this.matchedMap.get(userId);
    if (gameRecordId) {
      return this.ongoingGameMap.get(gameRecordId) ?? null;
    } else {
      return null;
    }
  }

  /**
   * ゲーム終了時
   */
  private gameEnd(game: GameServerMain): void {
    // ゲーム内容を保存
    saveGameRecord(game.record).catch((e) => {
      this.logger.error({ error: e }, 'Failed to save game record');
    });

    this.ongoingGameMap.delete(game.gameRecordId);
    this.matchedMap.delete(game.record.players.AL.userId);
    this.matchedMap.delete(game.record.players.BL.userId);
    this.logger.debug({ gameRecordId: game.gameRecordId }, 'Game end');
  }

  async playerDemandGameAction(userId: UserId, fromIndex: number, toIndex?: number): Promise<void> {
    const game = this.getGameForUserId(userId);
    if (!game) {
      return this.sendToUser(userId, {
        type: 'DENIED',
        reason: RequestDeniedReason.NO_GAME,
        message: { ja: '参加している試合が見つかりませんでした。' },
      });
    }

    const position = game.record.players.AL.userId === userId ? 'AL' : 'BL';
    const actions = game.getActionsForPlayer(position, fromIndex, toIndex);
    this.sendToUser(userId, {
      type: 'GAME_ACTION',
      fromIndex,
      actions,
    });
  }

  /**
   * 開始前または進行中のゲームの場合のレスポンス
   */
  private async getResponseForOngoingGame(userId: UserId, gameRecordId: GameRecordId): Promise<ZombalsResponse | null> {
    // 開始前のゲームかどうか確認
    const waitingGame = this.waitingGameMap.get(gameRecordId);
    if (waitingGame) {
      if (waitingGame.waitUntil > getCurrentTime()) {
        // 開始前のゲーム
        return {
          type: 'GAME_WAITING',
          waitUntil: waitingGame.waitUntil,
        };
      } else {
        // 時間切れ
        this.waitingGameMap.delete(gameRecordId);
        this.matchedMap.delete(userId);
        return {
          type: 'DENIED',
          reason: RequestDeniedReason.EXPIRED,
          message: { ja: '試合開始がタイムアウトしました。（相手が接続不良？）' },
        };
      }
    }

    // 進行中のゲームかどうか確認
    const ongoingGame = this.ongoingGameMap.get(gameRecordId);
    if (ongoingGame) {
      return {
        type: 'GAME_START',
        userIds: {
          AL: ongoingGame.record.players.AL.userId,
          BL: ongoingGame.record.players.BL.userId,
        },
      };
    }

    // 存在しないか終了済みゲーム
    return null;
  }

  /**
   * 次のマッチングを実行する
   */
  async makeNextMatch(): Promise<void> {
    const userIdPair = this.findNextMatchingPair();
    if (!userIdPair) return;

    const waitingA = this.waitingPlayerMap.get(userIdPair[0]);
    const waitingB = this.waitingPlayerMap.get(userIdPair[1]);
    if (!waitingA || !waitingB) return;

    this.waitingPlayerMap.delete(userIdPair[0]);
    this.waitingPlayerMap.delete(userIdPair[1]);

    // ゲームIDを仮決め
    const gameRecordId = uuidv7() as GameRecordId;

    this.matchedMap.set(userIdPair[0], gameRecordId);
    this.matchedMap.set(userIdPair[1], gameRecordId);

    // 開始前ゲームを作成
    const timer = setTimeout(() => this.timeoutGameStart(gameRecordId), ACCEPT_TIMEOUT_MS);
    const game: LobbyWaitingGame = {
      gameRecordId,
      players: [waitingA.player, waitingB.player],
      accepted: [false, false],
      waitUntil: getFutureTime(ACCEPT_TIMEOUT_MS),
      timer,
    };
    this.waitingGameMap.set(gameRecordId, game);
    this.logger.debug({ gameRecordId, userIds: userIdPair }, `Created waiting game`);

    // 両者に通知
    const response: GameWaitingResponse = {
      type: 'GAME_WAITING',
      waitUntil: game.waitUntil,
    };
    this.sendToUser(userIdPair[0], response);
    this.sendToUser(userIdPair[1], response);
  }

  private findNextMatchingPair(): [UserId, UserId] | null {
    if (this.waitingPlayerMap.size < 2) return null;

    // 今は単純に待ち行列先頭の 2 名をマッチングさせるだけ
    const time = getCurrentTime();
    const waitings = [...this.waitingPlayerMap.values()];
    for (let i = 0; i < waitings.length; i++) {
      const waiting1 = waitings[i];
      if (waiting1.waitUntil <= time) {
        // Expired...
        this.waitingPlayerMap.delete(waiting1.player.userId);
        continue;
      }

      for (let j = i + 1; j < waitings.length; j++) {
        const waiting2 = waitings[j];
        if (waiting2.waitUntil <= time) {
          this.waitingPlayerMap.delete(waiting2.player.userId);
          continue;
        }

        if (waiting1.passCode || waiting2.passCode) {
          if (waiting1.passCode !== waiting2.passCode) {
            continue;
          }
        }

        // マッチング成立
        return [waiting1.player.userId, waiting2.player.userId];
      }
    }
    return null;
  }

  private timeoutGameStart(gameRecordId: GameRecordId): void {
    const game = this.waitingGameMap.get(gameRecordId);
    if (game) {
      this.waitingGameMap.delete(gameRecordId);
      game.players.forEach((player) => {
        this.matchedMap.delete(player.userId);
        this.sendToUser(player.userId, {
          type: 'DENIED',
          reason: RequestDeniedReason.EXPIRED,
          message: { ja: '試合開始がタイムアウトしました。' },
        });
      });
    }
  }
}
