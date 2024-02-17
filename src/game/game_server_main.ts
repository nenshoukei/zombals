import { randomInt } from 'node:crypto';
import { GameServerContext } from './game_server_context';
import {
  BY_LEADER,
  CardType,
  GameAction,
  GameActionType,
  GameCommand,
  GameCommandType,
  GameForbiddenOperationError,
  GamePlayer,
  GameRecord,
  GameRecordId,
  getCurrentTime,
  LeaderPosition,
  LEADERS,
  UserId,
} from '@/types';

export class GameServerMain {
  private _ctx: GameServerContext;

  constructor(gameRecordId: GameRecordId, players: [GamePlayer, GamePlayer]) {
    // ゲームコンテキストを作成
    this._ctx = new GameServerContext({
      id: gameRecordId,
      seed: randomInt(2 ** 32),
      first: LEADERS[randomInt(2)],
      winner: null,
      startedAt: getCurrentTime(),
      finishedAt: null,
      players: {
        AL: players[0],
        BL: players[1],
      },
      actions: [],
    });
  }

  get gameRecordId(): GameRecordId {
    return this._ctx.record.id;
  }

  get record(): GameRecord {
    return this._ctx.record;
  }

  get isFinished(): boolean {
    return Boolean(this._ctx.record.finishedAt);
  }

  get onAction() {
    return this._ctx.onAction;
  }

  private getPositionOfUser(userId: UserId): LeaderPosition {
    return this._ctx.record.players.AL.userId === userId ? 'AL' : 'BL';
  }

  isActivePlayer(userId: UserId): boolean {
    return this._ctx.record.players[this._ctx.ally.position].userId === userId;
  }

  /**
   * ゲーム開始
   */
  startGame() {
    this._ctx.startGame();
  }

  /**
   * プレイヤーがゲームから退室した時
   *
   * @param userId 退室したプレイヤーユーザーID
   */
  userLeave(userId: UserId): void {
    // 投了扱いとする
    this._ctx.playerSurrender(this.getPositionOfUser(userId));
  }

  /**
   * プレイヤーからコマンドを受け取った
   */
  receiveGameCommand(userId: UserId, command: GameCommand) {
    const position = this.getPositionOfUser(userId);
    switch (command.type) {
      case GameCommandType.MULLIGAN: {
        this._ctx.playerMulligan(position, command.swpped);
        break;
      }
      case GameCommandType.TURN_END: {
        if (this._ctx.ally.position !== position) {
          throw new GameForbiddenOperationError('Not active turn');
        }
        this._ctx.endCurrentTurn();
        break;
      }
      case GameCommandType.SURRENDER: {
        this._ctx.playerSurrender(position);
        break;
      }
      case GameCommandType.EMOTE: {
        this._ctx.playerEmote(position, command.emoteId);
        break;
      }
      case GameCommandType.ATTACK: {
        if (this._ctx.ally.position !== position) {
          throw new GameForbiddenOperationError('Not active turn');
        }
        this._ctx.playerAttack(command.atacker, command.target);
        break;
      }
      case GameCommandType.TENTION_UP: {
        if (this._ctx.ally.position !== position) {
          throw new GameForbiddenOperationError('Not active turn');
        }
        this._ctx.playerTentionUp(position);
        break;
      }
      case GameCommandType.USE_CARD: {
        if (this._ctx.ally.position !== position) {
          throw new GameForbiddenOperationError('Not active turn');
        }
        this._ctx.playerUseCard(position, command.cardId, command.target);
        break;
      }
      case GameCommandType.OPTION_SELECTED: {
        this._ctx.playerSelectOption(position, command.selectId, command.selectedIndex);
        break;
      }
      case GameCommandType.HAND_SELECTED: {
        this._ctx.playerSelectHand(position, command.selectId, command.selectedIndexes);
        break;
      }
    }

    // ゲーム終了など確認
    this._ctx.checkConditions();
  }

  /**
   * プレイヤー向けに action をフィルタリング
   */
  filterActionForPlayer(action: GameAction, position: LeaderPosition): GameAction {
    if (action.type === GameActionType.START) {
      // 相手の手札を隠す
      const opponent = BY_LEADER[position].enemyLeader;
      return {
        ...action,
        hands: {
          ...action.hands,
          [opponent]: action.hands[opponent].map(() => ({ type: CardType.MASKED })),
        },
      };
    } else if (action.type === GameActionType.DRAW) {
      // 自分のドローでなければ隠す
      if (action.actor !== position) {
        return {
          ...action,
          card: { type: CardType.MASKED },
        };
      }
    } else if (action.type === GameActionType.ADD_CARD) {
      // 自分のカードでなければ隠す
      if (action.actor !== position) {
        return {
          ...action,
          cards: action.cards.map(() => ({ type: CardType.MASKED })),
        };
      }
    }
    return action;
  }

  /**
   * プレイヤー向けの actions を取得
   */
  getActionsForPlayer(position: LeaderPosition, fromIndex: number, toIndex?: number): GameAction[] {
    const actions = this._ctx.record.actions.slice(fromIndex, toIndex);
    return actions.map((action) => this.filterActionForPlayer(action, position));
  }
}
