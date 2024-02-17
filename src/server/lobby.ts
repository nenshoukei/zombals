import { uuidv7 } from 'uuidv7';
import { getGamePlayer } from './db';
import { CLIENT_VERSION } from '@/config/client_version';
import { GameServerMain } from '@/game/game_server_main';
import {
  GameActionResponse,
  GamePlayer,
  GameRecordId,
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

const MATCHING_TIMEOUT_MS = 3 * 60 * 1000;
const ACCEPT_TIMEOUT_MS = 10 * 1000;

export interface LobbyWaitingPlayer {
  /** 待ち受けプレイヤー */
  player: GamePlayer;
  /** パスコード (同じパスコード同士でないとマッチングしない) */
  passCode?: string;
  /** 待ち受けタイムアウト時間 (エポックミリ秒) */
  waitUntil: Timestamp;
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
}

export interface UserSender {
  sendToUser(response: ZombalsResponse, userId: UserId): void;
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

  constructor(private userSender: UserSender) {
    this.waitingPlayerMap = new Map();
    this.matchedMap = new Map();
    this.waitingGameMap = new Map();
    this.ongoingGameMap = new Map();
  }

  private maintenanceModeResponse(): RequestDeniedResponse | null {
    // メンテナンスモード中
    if (process.env.MAINTENANCE_MODE) {
      return {
        type: 'DENIED',
        reason: RequestDeniedReason.MAINTENANCE,
      };
    }
    return null;
  }

  /**
   * プレイヤーをロビーに入室させる（マッチング開始）
   *
   * @param userId ユーザーID
   * @param req リクエスト
   * @returns レスポンス
   */
  async playerEnter(userId: UserId, req: LobbyEnterRequest): Promise<ZombalsResponse> {
    // メンテナンスモード中
    const maintenance = this.maintenanceModeResponse();
    if (maintenance) return maintenance;

    // クライアントのバージョンチェック
    if (req.clientVersion !== CLIENT_VERSION) {
      return {
        type: 'DENIED',
        reason: RequestDeniedReason.VERSION_MISMATCH,
      };
    }

    // 既にマッチングしていないか確認
    const gameRecordId = this.matchedMap.get(userId);
    if (gameRecordId) {
      // 開始前または進行中のゲームかどうか確認
      const response = await this.getResponseForOngoingGame(userId, gameRecordId);
      if (response) {
        return response;
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
        return {
          type: 'DENIED',
          reason: RequestDeniedReason.EXPIRED,
        };
      }
    } else {
      // プレイヤー情報とデッキ情報を取得して新しく並ぶ
      const player = await getGamePlayer(userId, req.deckId);
      waiting = {
        player,
        passCode: req.passCode,
        waitUntil: getFutureTime(MATCHING_TIMEOUT_MS),
      };
      this.waitingPlayerMap.set(userId, waiting);
      this.matchedMap.delete(userId);
    }

    return {
      type: 'LOBBY_WAITING',
      waitUntil: waiting.waitUntil,
    };
  }

  /**
   * プレイヤーをロビーから退室させる
   *
   * @param userId ユーザーID
   */
  async playerLeave(userId: UserId): Promise<void> {
    this.waitingPlayerMap.delete(userId);

    const gameRecordId = this.matchedMap.get(userId);
    if (gameRecordId) {
      const ongoingGame = this.ongoingGameMap.get(gameRecordId);
      if (ongoingGame) {
        // プレイヤーの退室をゲーム内にも反映
        ongoingGame.userLeave(userId);
      }

      // マッチング不成立として開始前ゲームは削除
      this.waitingGameMap.delete(gameRecordId);
      this.matchedMap.delete(userId);
    }
  }

  /**
   * プレイヤーがマッチングを受諾した
   */
  async playerStartGame(userId: UserId): Promise<ZombalsResponse> {
    // メンテナンスモード中
    const maintenance = this.maintenanceModeResponse();
    if (maintenance) return maintenance;

    // マッチ済みゲーム記録ID
    const gameRecordId = this.matchedMap.get(userId);
    if (!gameRecordId) {
      // マッチしていない
      return {
        type: 'DENIED',
        reason: RequestDeniedReason.NO_GAME,
      };
    }

    // 開始前または進行中のゲームがないか確認
    const response = await this.getResponseForOngoingGame(userId, gameRecordId);
    if (!response) {
      // 該当のゲームなし (どちらかが LEAVE してしまったか終了済み)
      return {
        type: 'DENIED',
        reason: RequestDeniedReason.NO_GAME,
      };
    }

    if (response.type === 'GAME_WAITING') {
      // 開始前のゲームだったら承諾済みにする
      const waitingGame = this.waitingGameMap.get(gameRecordId)!;
      const playerIndex = waitingGame.players[0].userId === userId ? 0 : 1;
      if (!waitingGame.accepted[playerIndex]) {
        waitingGame.accepted[playerIndex] = true;
      }

      if (waitingGame.accepted[0] && waitingGame.accepted[1]) {
        // 2人とも承諾したのでゲームを作成
        const game = this.createNewGame(waitingGame);
        this.waitingGameMap.delete(gameRecordId);
        this.ongoingGameMap.set(gameRecordId, game);
        return {
          type: 'GAME_START',
          userIds: {
            AL: game.record.players.AL.userId,
            BL: game.record.players.BL.userId,
          },
        };
      }
    }

    return response;
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

        this.userSender.sendToUser(response, userId);
      });
    });

    return game;
  }

  /**
   * ユーザーIDに対して進行中のゲームを返す
   */
  getGameForUserId(userId: UserId): GameServerMain | null {
    const gameRecordId = this.matchedMap.get(userId);
    if (gameRecordId) {
      return this.ongoingGameMap.get(gameRecordId) ?? null;
    } else {
      return null;
    }
  }

  /**
   * ゲーム終了の通知
   */
  gameEnd(gameRecordId: GameRecordId): void {
    const game = this.ongoingGameMap.get(gameRecordId);
    if (game) {
      this.ongoingGameMap.delete(gameRecordId);
      this.matchedMap.delete(game.record.players.AL.userId);
      this.matchedMap.delete(game.record.players.BL.userId);
    }
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
    this.waitingGameMap.set(gameRecordId, {
      gameRecordId,
      players: [waitingA.player, waitingB.player],
      accepted: [false, false],
      waitUntil: getFutureTime(ACCEPT_TIMEOUT_MS),
    });
  }

  private findNextMatchingPair(): [UserId, UserId] | null {
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
}
