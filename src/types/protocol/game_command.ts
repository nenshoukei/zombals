import { z } from 'zod';
import { zHandIndex, zId } from '../common';
import { zLeaderCellPosition, zTarget } from '../field';

/**
 * コマンドの共通インターフェース
 *
 * コマンドとは、クライアントで操作した内容をサーバーに送信する際に用いる構造体。
 * 操作した実際の結果は GameAction としてサーバーから返却される。
 */
const zGameCommandBase = z.object({
  /**
   * コマンドID
   *
   * クライアント側で生成する 1 から始まる連番。
   * コマンドに対応するレスポンスの区別用として用いる。
   */
  id: zId,
});

/**
 * コマンド種別
 */
export enum GameCommandType {
  /** マリガン */
  MULLIGAN = 'MULLIGAN',
  /** ターン終了 */
  TURN_END = 'TURN_END',
  /** 投了 */
  SURRENDER = 'SURRENDER',
  /** エモート */
  EMOTE = 'EMOTE',
  /** 攻撃 */
  ATTACK = 'ATTACK',
  /** テンションアップ */
  TENTION_UP = 'TENTION_UP',
  /** 手札にあるカードを使用 (テンションスキル / ヒーロースキルも兼用) */
  USE_CARD = 'USE_CARD',
  /** カード効果を選択した */
  OPTION_SELECTED = 'OPTION_SELECTED',
  /** 手札を選択した */
  HAND_SELECTED = 'HAND_SELECTED',
}

/**
 * マリガンのコマンド (何も交換しない場合でも送信する)
 */
export type GameMulliganCommand = z.infer<typeof zGameMulliganCommand>;
export const zGameMulliganCommand = zGameCommandBase.extend({
  type: z.literal(GameCommandType.MULLIGAN),
  /** 交換を選択した手札インデックス列 (何も交換しない場合は空配列) */
  swpped: z.array(zHandIndex),
});

/**
 * ターン終了のコマンド
 */
export type GameTurnEndCommand = z.infer<typeof zGameTurnEndCommand>;
export const zGameTurnEndCommand = zGameCommandBase.extend({
  type: z.literal(GameCommandType.TURN_END),
});

/**
 * 投了のコマンド
 */
export type GameSurrenderCommand = z.infer<typeof zGameSurrenderCommand>;
export const zGameSurrenderCommand = zGameCommandBase.extend({
  type: z.literal(GameCommandType.SURRENDER),
});

/**
 * エモートのコマンド
 */
export type GameEmoteCommand = z.infer<typeof zGameEmoteCommand>;
export const zGameEmoteCommand = zGameCommandBase.extend({
  type: z.literal(GameCommandType.EMOTE),
  /** エモートID */
  emoteId: zId,
});

/**
 * 攻撃のコマンド
 */
export type GameAttackCommand = z.infer<typeof zGameAttackCommand>;
export const zGameAttackCommand = zGameCommandBase.extend({
  type: z.literal(GameCommandType.ATTACK),
  /** 攻撃したリーダーまたはユニットのマスの位置 */
  atacker: zLeaderCellPosition,
  /** 攻撃されたリーダーまたはユニットのマスの位置 */
  target: zLeaderCellPosition,
});

/**
 * テンションアップのコマンド
 */
export type GameTentionUpCommand = z.infer<typeof zGameTentionUpCommand>;
export const zGameTentionUpCommand = zGameCommandBase.extend({
  type: z.literal(GameCommandType.TENTION_UP),
});

/**
 * 手札にあるカードを使用するコマンド
 */
export type GameUseCardCommand = z.infer<typeof zGameUseCardCommand>;
export const zGameUseCardCommand = zGameCommandBase.extend({
  type: z.literal(GameCommandType.USE_CARD),
  /** プレイされたカードの実体ID */
  cardId: zId,
  /** カードの使用対象 */
  target: zTarget.optional(),
});

/**
 * カード効果を選択した際のコマンド
 *
 * 必中の占いや選択などプレイヤーが選択する必要があるカードの処理時に
 * サーバーから SELECT_OPTION Action が送られてくるので、それに対応して
 * プレイヤーに効果を選択させる。
 *
 * プレイヤーが選択した番号を送信する。
 */
export type GameOptionSelectedCommand = z.infer<typeof zGameOptionSelectedCommand>;
export const zGameOptionSelectedCommand = zGameCommandBase.extend({
  type: z.literal(GameCommandType.OPTION_SELECTED),
  /** 選択ID (GameSelectOptionAction で渡されるもの) */
  selectId: zId,
  /** プレイヤーが選択した選択肢インデックス */
  selectedIndex: z.number().int().min(0),
});

/**
 * 手札を選択した際のコマンド
 *
 * カード効果などで手札を選択する必要がある場合に
 * サーバーから SELECT_HAND Action が送られてくるので、それに対応して
 * プレイヤーに手札を選択させる。複数選ぶ場合もある。
 *
 * プレイヤーが選択した手札番号を送信する。
 */
export type GameHandSelectedCommand = z.infer<typeof zGameHandSelectedCommand>;
export const zGameHandSelectedCommand = zGameCommandBase.extend({
  type: z.literal(GameCommandType.HAND_SELECTED),
  /** 選択ID (GameSelectHandAction で渡されるもの) */
  selectId: zId,
  /** プレイヤーが選択した手札インデックスの配列 */
  selectedIndexes: z.array(zHandIndex).min(1),
});

/**
 * コマンドのユニオン
 */
export type GameCommand = z.infer<typeof zGameCommand>;
export const zGameCommand = z.discriminatedUnion('type', [
  zGameMulliganCommand,
  zGameTurnEndCommand,
  zGameSurrenderCommand,
  zGameEmoteCommand,
  zGameAttackCommand,
  zGameTentionUpCommand,
  zGameUseCardCommand,
  zGameOptionSelectedCommand,
  zGameHandSelectedCommand,
]);
