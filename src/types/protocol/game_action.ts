import { z } from 'zod';
import { zHandIndex, zId, zMaxStat, zSelectOption, zStat, zTimestamp } from '../common';
import { zCellPosition, zLeaderCellPosition, zLeaderMap, zLeaderPosition, zTarget } from '../field';
import {
  zBadgeState,
  zCardState,
  zDrawnCardState,
  zEquippedWeaponState,
  zFieldBuildingState,
  zFieldUnitState,
  zFloorState,
  zHeroSkillCardState,
  zMaskedCardState,
  zTentionSkillCardState,
} from '../game_state';
import { MAX_TENTION } from '@/config/common';

/**
 * アクションの共通インターフェース
 *
 * アクションとは、サーバーからクライアントに返却される操作 (Command) の実行結果。
 * すべてサーバーサイドに記録されているので改ざん不可能。
 */
const zGameActionBase = z.object({
  /** アクションを実行したプレイヤー */
  actor: zLeaderPosition,
  /** アクションを実行した日時 (サーバー側エポックミリ秒) */
  timestamp: zTimestamp,
});

/**
 * ゲーム中アクションの種別
 */
export enum GameActionType {
  /** ゲーム開始 */
  START = 'START',
  /** マリガン完了 */
  MULLIGAN = 'MULLIGAN',
  /** ターン開始 */
  TURN_START = 'TURN_START',
  /** 投了 */
  SURRENDER = 'SURRENDER',
  /** ゲーム終了 */
  END = 'END',
  /** エモート */
  EMOTE = 'EMOTE',
  /** カードを引いた */
  DRAW = 'DRAW',
  /** カードを手札に加えた */
  ADD_CARD = 'ADD_CARD',
  /** カードを捨てた */
  DISCARD = 'DISCARD',
  /** 攻撃 */
  ATTACK = 'ATTACK',
  /** テンションアップ */
  TENTION_UP = 'TENTION_UP',
  /** テンション数セット */
  TENTION_SET = 'TENTION_SET',
  /** 手札からカードを使用 (テンションスキル / ヒーロースキルも兼用) */
  USE_CARD = 'USE_CARD',
  /** 武器を装備 */
  EQUIP_WEAPON = 'EQUIP_WEAPON',
  /** 装備武器が破壊 */
  BREAK_WEAPON = 'BREAK_WEAPON',
  /** テンションスキルが変更 */
  TENTION_SKILL_CHANGED = 'TENTION_SKILL_CHANGED',
  /** ヒーロースキルが変更 */
  HERO_SKILL_CHANGED = 'HERO_SKILL_CHANGED',
  /** リーダーのスタッツ更新 */
  LEADER_STATS_UPDATE = 'LEADER_STATS_UPDATE',
  /** リーダーがダメージを受けた */
  LEADER_GAIN_DAMAGE = 'LEADER_GAIN_DAMAGE',
  /** リーダーが回復した */
  LEADER_GAIN_HEAL = 'LEADER_GAIN_HEAL',
  /** ユニットがフィールドに登場 */
  UNIT_PUT = 'UNIT_PUT',
  /** ユニットのスタッツ更新 */
  UNIT_STATS_UPDATE = 'UNIT_STATS_UPDATE',
  /** ユニットがダメージを受けた */
  UNIT_GAIN_DAMAGE = 'UNIT_GAIN_DAMAGE',
  /** ユニットが回復した */
  UNIT_GAIN_HEAL = 'UNIT_GAIN_HEAL',
  /** ユニットが移動した */
  UNIT_MOVE = 'UNIT_MOVE',
  /** ユニットの位置を交換した */
  UNIT_SWAP = 'UNIT_SWAP',
  /** ユニットの所有者が変更した */
  UNIT_OWNER_CHANGED = 'UNIT_OWNER_CHANGED',
  /** ユニットが死亡した */
  UNIT_DESTROYED = 'UNIT_DESTROYED',
  /** ユニットが追放された */
  UNIT_EXILED = 'UNIT_EXILED',
  /** 建物がフィールドに設置 */
  BULDING_PUT = 'BULDING_PUT',
  /** 建物のスタッツ更新 */
  BULDING_STATS_UPDATE = 'BULDING_STATS_UPDATE',
  /** 建物が破壊された */
  BULDING_DESTROED = 'BULDING_DESTROED',
  /** 地形がフィールドに設置 */
  FLOOR_PUT = 'FLOOR_PUT',
  /** 地形が破壊された */
  FLOOR_DESTROYED = 'FLOOR_DESTROYED',
  /** バッジが追加 */
  BADGE_ADDED = 'BADGE_ADDED',
  /** バッジが削除 */
  BADGE_REMOVED = 'BADGE_REMOVED',
  /** プレイヤーの効果選択が必要 */
  SELECT_OPTION = 'SELECT_OPTION',
  /** プレイヤーの効果選択結果 */
  OPTION_SELECTED = 'OPTION_SELECTED',
  /** プレイヤーの手札選択が必要 */
  SELECT_HAND = 'SELECT_HAND',
  /** プレイヤーの選んだ手札 */
  HAND_SELECTED = 'HAND_SELECTED',
}

/**
 * ゲーム開始のアクション
 */
export type GameStartAction = z.infer<typeof zGameStartAction>;
export const zGameStartAction = zGameActionBase.extend({
  type: z.literal(GameActionType.START),

  /**
   * 先攻プレイヤー
   */
  first: zLeaderCellPosition,

  /**
   * プレイヤーの初期手札 (マリガン前)
   */
  hands: zLeaderMap(z.array(zDrawnCardState)),

  /**
   * マリガンがタイムアウトする日時 (サーバー側エポックミリ秒)
   */
  mulliganWillEndAt: zTimestamp,
});

/**
 * 両プレイヤーがマリガン完了した時のアクション
 */
export type GameMulliganAction = z.infer<typeof zGameMulliganAction>;
export const zGameMulliganAction = zGameActionBase.extend({
  type: z.literal(GameActionType.MULLIGAN),
  /** 両プレイヤーが交換した手札インデックス */
  swapped: zLeaderMap(z.array(zHandIndex)),
});

/**
 * ターン開始のアクション
 */
export type GameTurnStartAction = z.infer<typeof zGameTurnStartAction>;
export const zGameTurnStartAction = zGameActionBase.extend({
  type: z.literal(GameActionType.TURN_START),
  /** ターン番号 (1から開始) */
  turn: z.number().int().min(1),
  /**
   * ターンがタイムアウトする日時 (サーバー側エポックミリ秒)
   *
   * ターンには時間制限があるので、この時間になったら強制終了される。
   * サーバー側の時計なので、クライアントサイドで用いる際は
   * timestamp による補正が必要なことに注意。
   *
   * この時間を過ぎて送信されたターン内 Command は受付されない。
   * (ターン外でもできる GameSurrenderCommand と GameEmoteCommand は除く)
   */
  turnWillEndAt: zTimestamp,
});

/**
 * 投了のアクション
 */
export type GameSurrenderAction = z.infer<typeof zGameSurrenderAction>;
export const zGameSurrenderAction = zGameActionBase.extend({
  type: z.literal(GameActionType.SURRENDER),
});

/**
 * ゲーム終了のアクション
 */
export type GameEndAction = z.infer<typeof zGameEndAction>;
export const zGameEndAction = zGameActionBase.extend({
  type: z.literal(GameActionType.END),
  /** 勝者 (ドローの場合は `null`) */
  winner: zLeaderPosition.nullable(),
});

/**
 * エモートのアクション
 */
export type GameEmoteAction = z.infer<typeof zGameEmoteAction>;
export const zGameEmoteAction = zGameActionBase.extend({
  type: z.literal(GameActionType.EMOTE),
  /** エモートID */
  emoteId: zId,
});

/**
 * カードを引いた時のアクション
 */
export type GameDrawAction = z.infer<typeof zGameDrawAction>;
export const zGameDrawAction = zGameActionBase.extend({
  type: z.literal(GameActionType.DRAW),
  /**
   * 引いたカード
   *
   * - 相手ターンの場合はマスクカードになる。
   * - 山札切れの場合は FatigueCardState になる。相手ターンでも同様。
   */
  card: zDrawnCardState,
});

/**
 * カードを手札に直接加えた時のアクション
 */
export type GameAddCardAction = z.infer<typeof zGameDrawAction>;
export const zGameAddCardAction = zGameActionBase.extend({
  type: z.literal(GameActionType.ADD_CARD),
  /**
   * 手札に加えたカード
   *
   * 対戦相手のみしか見えないカードの場合は MaskedCardState になる。
   */
  cards: z.array(z.union([zCardState, zMaskedCardState])).min(1),
});

/**
 * カードを捨てた時のアクション
 */
export type GameDiscardAction = z.infer<typeof zGameDiscardAction>;
export const zGameDiscardAction = zGameActionBase.extend({
  type: z.literal(GameActionType.DISCARD),
  /** 捨てられたカード (必ず公開される) */
  cards: z.array(zCardState).min(1),
});

/**
 * 攻撃のアクション
 */
export type GameAttackAction = z.infer<typeof zGameAttackAction>;
export const zGameAttackAction = zGameActionBase.extend({
  type: z.literal(GameActionType.ATTACK),
  /** 攻撃したリーダーまたはユニットのマスの位置 */
  ataccker: zLeaderCellPosition,
  /** 攻撃されたリーダーまたはユニットのマスの位置 */
  target: zLeaderCellPosition,
});

/**
 * テンションアップのアクション
 */
export type GameTentionUpAction = z.infer<typeof zGameTentionUpAction>;
export const zGameTentionUpAction = zGameActionBase.extend({
  type: z.literal(GameActionType.TENTION_UP),
  /** アップしたテンションの数 */
  tentionUpCount: z.number().int().min(1),
});

/**
 * テンション数セットのアクション
 */
export type GameTentionSetAction = z.infer<typeof zGameTentionSetAction>;
export const zGameTentionSetAction = zGameActionBase.extend({
  type: z.literal(GameActionType.TENTION_SET),
  /** セットされたテンション数 */
  newTentionCount: z.number().int().min(0).max(MAX_TENTION),
});

/**
 * カードを手札から使用のアクション (テンションスキル / ヒーロースキルも兼用)
 */
export type GameUseCardAction = z.infer<typeof zGameUseCardAction>;
export const zGameUseCardAction = zGameActionBase.extend({
  type: z.literal(GameActionType.USE_CARD),
  /** プレイされたカードの実体情報 (必ず公開される) */
  card: zCardState,
  /** 対象 */
  target: zTarget.optional(),
});

/**
 * 武器装備のアクション
 */
export type GameEquipWeaponAction = z.infer<typeof zGameEquipWeaponAction>;
export const zGameEquipWeaponAction = zGameActionBase.extend({
  type: z.literal(GameActionType.EQUIP_WEAPON),
  /** 装備した武器 */
  weapon: zEquippedWeaponState,
});

/**
 * 装備武器の破壊アクション
 */
export type GameBreakWeaponAction = z.infer<typeof zGameBreakWeaponAction>;
export const zGameBreakWeaponAction = zGameActionBase.extend({
  type: z.literal(GameActionType.BREAK_WEAPON),
});

/**
 * テンションスキル変更アクション
 */
export type GameTentionSkillChangedAction = z.infer<typeof zGameTentionSkillChangedAction>;
export const zGameTentionSkillChangedAction = zGameActionBase.extend({
  type: z.literal(GameActionType.TENTION_SKILL_CHANGED),
  /** 新しいテンションスキルカード */
  tentionSkill: zTentionSkillCardState,
});

/**
 * ヒーロースキル変更アクション
 */
export type GameHeroSkillChangedAction = z.infer<typeof zGameHeroSkillChangedAction>;
export const zGameHeroSkillChangedAction = zGameActionBase.extend({
  type: z.literal(GameActionType.HERO_SKILL_CHANGED),
  /** 新しいヒーロースキルカード */
  heroSkill: zHeroSkillCardState,
});

/**
 * リーダーのスタッツ更新アクション
 */
export type LeaderStatsUpdateAction = z.infer<typeof zLeaderStatsUpdateAction>;
export const zLeaderStatsUpdateAction = zGameActionBase.extend({
  type: z.literal(GameActionType.LEADER_STATS_UPDATE),
  /** 攻撃力 (装備も含む) */
  power: zStat,
  /** 最大 HP */
  maxHP: zMaxStat,
  /** 残り HP */
  currentHP: zStat,
  /** 最大 MP */
  maxMP: zMaxStat,
  /** 残り MP */
  currentMP: zStat,
  /** テンション数 */
  tentionCount: z.number().int().min(0).max(MAX_TENTION),
});

/**
 * リーダーがダメージを受けたアクション
 */
export type LeaderGainDamageAction = z.infer<typeof zLeaderGainDamageAction>;
export const zLeaderGainDamageAction = zGameActionBase.extend({
  type: z.literal(GameActionType.LEADER_GAIN_DAMAGE),
  /** 受けたダメージ */
  damage: z.number().min(0),
});

/**
 * リーダーが回復したアクション
 */
export type LeaderGainHealAction = z.infer<typeof zLeaderGainHealAction>;
export const zLeaderGainHealAction = zGameActionBase.extend({
  type: z.literal(GameActionType.LEADER_GAIN_HEAL),
  /** 受けた回復量 */
  heal: z.number().min(0),
});

/**
 * ユニットがフィールドに登場アクション
 */
export type UnitPutAction = z.infer<typeof zUnitPutAction>;
export const zUnitPutAction = zGameActionBase.extend({
  type: z.literal(GameActionType.UNIT_PUT),
  /** 登場した場所 */
  position: zCellPosition,
  /** 登場したユニット */
  unit: zFieldUnitState,
});

/**
 * ユニットのスタッツ更新アクション
 */
export type UnitStatsUpdateAction = z.infer<typeof zUnitStatsUpdateAction>;
export const zUnitStatsUpdateAction = zGameActionBase.extend({
  type: z.literal(GameActionType.UNIT_STATS_UPDATE),
  /** ユニットの場所 */
  position: zCellPosition,
  /** 攻撃力 */
  power: zStat,
  /** 最大HP */
  maxHP: zMaxStat,
  /** 現在HP */
  currentHP: zStat,
});

/**
 * ユニットがダメージを受けたアクション
 */
export type UnitGainDamageAction = z.infer<typeof zUnitGainDamageAction>;
export const zUnitGainDamageAction = zGameActionBase.extend({
  type: z.literal(GameActionType.UNIT_GAIN_DAMAGE),
  /** ユニットの場所 */
  position: zCellPosition,
  /** 受けたダメージ */
  damage: z.number().min(0),
});

/**
 * ユニットが回復したアクション
 */
export type UnitGainHealAction = z.infer<typeof zUnitGainHealAction>;
export const zUnitGainHealAction = zGameActionBase.extend({
  type: z.literal(GameActionType.UNIT_GAIN_HEAL),
  /** ユニットの場所 */
  position: zCellPosition,
  /** 受けた回復量 */
  heal: z.number().min(0),
});

/**
 * ユニットが移動したアクション
 */
export type UnitMoveAction = z.infer<typeof zUnitMoveAction>;
export const zUnitMoveAction = zGameActionBase.extend({
  type: z.literal(GameActionType.UNIT_MOVE),
  /** ユニットの移動元の場所 */
  from: zCellPosition,
  /** ユニットの移動先の場所 */
  to: zCellPosition,
});

/**
 * ユニットの位置を交換したアクション
 */
export type UnitSwapAction = z.infer<typeof zUnitSwapAction>;
export const zUnitSwapAction = zGameActionBase.extend({
  type: z.literal(GameActionType.UNIT_SWAP),
  /** 対象ユニット1の位置 */
  position1: zCellPosition,
  /** 対象ユニット2の位置 */
  position2: zCellPosition,
});

/**
 * ユニットの所有者が変更したアクション
 */
export type UnitOwnerChangedAction = z.infer<typeof zUnitOwnerChangedAction>;
export const zUnitOwnerChangedAction = zGameActionBase.extend({
  type: z.literal(GameActionType.UNIT_OWNER_CHANGED),
  /** 対象ユニットの移動元位置 */
  from: zCellPosition,
  /** 移動先位置 */
  to: zCellPosition,
});

/**
 * ユニットが死亡したアクション
 */
export type UnitDestroyedAction = z.infer<typeof zUnitDestroyedAction>;
export const zUnitDestroyedAction = zGameActionBase.extend({
  type: z.literal(GameActionType.UNIT_DESTROYED),
  /** ユニットの場所 */
  position: zCellPosition,
});

/**
 * ユニットが追放されたアクション
 */
export type UnitExiledAction = z.infer<typeof zUnitExiledAction>;
export const zUnitExiledAction = zGameActionBase.extend({
  type: z.literal(GameActionType.UNIT_EXILED),
  /** ユニットの場所 */
  position: zCellPosition,
});

/**
 * 建物がフィールドに設置されたアクション
 */
export type BuildingPutAction = z.infer<typeof zBuildingPutAction>;
export const zBuildingPutAction = zGameActionBase.extend({
  type: z.literal(GameActionType.BULDING_PUT),
  /** 建物の場所 */
  position: zCellPosition,
  /** 設置された建物 */
  building: zFieldBuildingState,
});

/**
 * 建物のスタッツ更新アクション
 */
export type BuildingStatsUpdateAction = z.infer<typeof zBuildingStatsUpdateAction>;
export const zBuildingStatsUpdateAction = zGameActionBase.extend({
  type: z.literal(GameActionType.BULDING_STATS_UPDATE),
  /** 建物の場所 */
  position: zCellPosition,
  /** 耐久度 */
  durability: zStat,
});

/**
 * 建物が破壊されたアクション
 */
export type BuildingDestroyedAction = z.infer<typeof zBuildingDestroyedAction>;
export const zBuildingDestroyedAction = zGameActionBase.extend({
  type: z.literal(GameActionType.BULDING_DESTROED),
  /** 建物の場所 */
  position: zCellPosition,
});

/**
 * 地形がフィールドに設置されたアクション
 */
export type FloorPutAction = z.infer<typeof zFloorPutAction>;
export const zFloorPutAction = zGameActionBase.extend({
  type: z.literal(GameActionType.FLOOR_PUT),
  /** 地形の場所 */
  position: zCellPosition,
  /** 設置された地形 */
  floor: zFloorState,
});

/**
 * 地形が破壊されたアクション
 */
export type FloorDestroyedAction = z.infer<typeof zFloorDestroyedAction>;
export const zFloorDestroyedAction = zGameActionBase.extend({
  type: z.literal(GameActionType.FLOOR_DESTROYED),
  /** 地形の場所 */
  position: zCellPosition,
});

/**
 * パワフルバッジが追加されたアクション
 */
export const zBadgeAddedAction = zGameActionBase.extend({
  type: z.literal(GameActionType.BADGE_ADDED),
  /** バッジ */
  badge: zBadgeState,
});

/**
 * パワフルバッジが削除されたアクション
 */
export const zBadgeRemovedAction = zGameActionBase.extend({
  type: z.literal(GameActionType.BADGE_REMOVED),
  /** 削除されたバッジ配列 */
  badges: z.array(zBadgeState).min(1),
});

/**
 * プレイヤーの効果選択が必要時のアクション
 */
export type GameSelectOptionAction = z.infer<typeof zGameSelectOptionAction>;
export const zGameSelectOptionAction = zGameActionBase.extend({
  type: z.literal(GameActionType.SELECT_OPTION),
  /** 選択ID (返答の GameOptionSelectedCommand で返す) */
  selectId: zId,
  /** 選択肢 */
  options: z.array(zSelectOption).min(2),
});

/**
 * プレイヤーが効果を選択した結果のアクション
 */
export type GameOptionSelectedAction = z.infer<typeof zGameOptionSelectedAction>;
export const zGameOptionSelectedAction = zGameActionBase.extend({
  type: z.literal(GameActionType.OPTION_SELECTED),
  /** 選択ID */
  selectId: zId,
  /** プレイヤーが選択した選択肢インデックス */
  selectedIndex: z.number().int().min(0),
});

/**
 * プレイヤーの手札選択が必要時のアクション
 */
export type GameSelectHandAction = z.infer<typeof zGameSelectHandAction>;
export const zGameSelectHandAction = zGameActionBase.extend({
  type: z.literal(GameActionType.SELECT_HAND),
  /** 選択ID (返答の GameOptionSelectedCommand で返す) */
  selectId: zId,
  /** 選ぶ枚数 */
  numberOfCards: z.number().min(1),
  /** 選べる手札インデックス */
  selectableHands: z.array(zHandIndex).min(1),
});

/**
 * プレイヤーが手札を選択した結果のアクション
 */
export type GameHandSelectedAction = z.infer<typeof zGameHandSelectedAction>;
export const zGameHandSelectedAction = zGameActionBase.extend({
  type: z.literal(GameActionType.HAND_SELECTED),
  /** 選択ID */
  selectId: zId,
  /** プレイヤーが選択した手札インデックス */
  selectedIndexes: z.array(zHandIndex).min(1),
});

/**
 * ゲーム中のアクション情報
 */
export type GameAction = z.infer<typeof zGameAction>;
export const zGameAction = z.discriminatedUnion('type', [
  zGameStartAction,
  zGameMulliganAction,
  zGameTurnStartAction,
  zGameSurrenderAction,
  zGameEndAction,
  zGameEmoteAction,
  zGameDrawAction,
  zGameAddCardAction,
  zGameDiscardAction,
  zGameAttackAction,
  zGameTentionUpAction,
  zGameTentionSetAction,
  zGameUseCardAction,
  zGameEquipWeaponAction,
  zGameBreakWeaponAction,
  zGameTentionSkillChangedAction,
  zGameHeroSkillChangedAction,
  zLeaderStatsUpdateAction,
  zLeaderGainDamageAction,
  zLeaderGainHealAction,
  zUnitPutAction,
  zUnitStatsUpdateAction,
  zUnitGainDamageAction,
  zUnitGainHealAction,
  zUnitMoveAction,
  zUnitSwapAction,
  zUnitOwnerChangedAction,
  zUnitDestroyedAction,
  zUnitExiledAction,
  zBuildingPutAction,
  zBuildingStatsUpdateAction,
  zBuildingDestroyedAction,
  zFloorPutAction,
  zFloorDestroyedAction,
  zBadgeAddedAction,
  zBadgeRemovedAction,
  zGameSelectOptionAction,
  zGameOptionSelectedAction,
  zGameSelectHandAction,
  zGameHandSelectedAction,
]);
