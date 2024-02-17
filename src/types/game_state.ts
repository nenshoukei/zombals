import { z } from 'zod';
import { CardType, HandIndex, Id, zHandIndex, zId, zMaxStat, zStat } from './common';
import {
  CellPosition,
  EffectEndTiming,
  EffectSource,
  EffectTarget,
  LeaderPosition,
  zCellPosition,
  zEffectEndTiming,
  zEffectSource,
  zEffectTarget,
  zLeaderMap,
  zLeaderPosition,
} from './field';
import { MAX_TENTION } from '@/config/common';

/**
 * ゲームで使われるカード実体情報の共通部分
 */
type CardStateBase = {
  /** 実体カードID (1ゲーム内ごとに1から始まる連番) */
  id: Id;
  /** カード定義参照ID */
  cardDefId: Id;
  /** カード所有者 */
  owner: LeaderPosition;
  /** MPコスト */
  cost: number;
  /** トークンかどうか (コピーの場合も true になる) */
  isToken?: boolean;
  /** 熟練度 増分 */
  proficiencyPlus: number;
};
const zCardStateBase = z.object({
  id: zId,
  cardDefId: zId,
  owner: zLeaderPosition,
  cost: zStat,
  isToken: z.boolean().optional(),
  proficiencyPlus: z.number().int().min(0),
});

/**
 * ユニットカードの実体
 */
export type UnitCardState = CardStateBase & {
  /** カード種別 */
  type: CardType.UNIT;
  /** 攻撃力 */
  power: number;
  /** 最大HP */
  maxHP: number;
  /** 石化状態かどうか */
  isStoned?: boolean;
};
export const zUnitCardState = zCardStateBase.extend({
  type: z.literal(CardType.UNIT),
  power: zStat,
  maxHP: zMaxStat,
  isStoned: z.boolean().optional(),
});

/**
 * 特技カードの実体
 */
export type SpellCardState = CardStateBase & {
  /** カード種別 */
  type: CardType.SPELL;
};
export const zSpellCardState = zCardStateBase.extend({
  type: z.literal(CardType.SPELL),
});

/**
 * 武器カードの実体
 */
export type WeaponCardState = CardStateBase & {
  /** カード種別 */
  type: CardType.WEAPON;
  /** 攻撃力 */
  power: number;
  /** 耐久力 */
  durability: number;
};
export const zWeaponCardState = zCardStateBase.extend({
  type: z.literal(CardType.WEAPON),
  power: zStat,
  durability: zStat,
});

/**
 * 英雄カードの実体
 */
export type HeroCardState = CardStateBase & {
  /** カード種別 */
  type: CardType.HERO;
};
export const zHeroCardState = zCardStateBase.extend({
  type: z.literal(CardType.HERO),
});

/**
 * 建物カードの実体
 */
export type BuildingCardState = CardStateBase & {
  /** カード種別 */
  type: CardType.BUILDING;
};
export const zBuildingCardState = zCardStateBase.extend({
  type: z.literal(CardType.BUILDING),
});

/**
 * テンションスキルカードの実体
 */
export type TentionSkillCardState = CardStateBase & {
  /** カード種別 */
  type: CardType.TENTION_SKILL;
};
export const zTentionSkillCardState = zCardStateBase.extend({
  type: z.literal(CardType.TENTION_SKILL),
});

/**
 * ヒーロースキルカードの実体
 */
export type HeroSkillCardState = CardStateBase & {
  /** カード種別 */
  type: CardType.HERO_SKILL;
};
export const zHeroSkillCardState = zCardStateBase.extend({
  type: z.literal(CardType.HERO_SKILL),
});

/**
 * 山札のカードが切れている時にドローした際に渡されるカード
 *
 * ファティーグダメージを受ける。
 *
 * 実体カードではないので ID を持たない。
 */
export type FatigueCardState = {
  /** カード種別 */
  type: CardType.FATIGUE;
};
export const zFatigueCardState = z.object({
  type: z.literal(CardType.FATIGUE),
});

/**
 * マスク状態カード
 *
 * 対戦相手がドローしたり手札に加えたりするカードはマスク状態になる。
 *
 * 実体カードではないので ID を持たない。
 */
export type MaskedCardState = {
  /** カード種別 */
  type: CardType.MASKED;
};
export const zMaskedCardState = z.object({
  type: z.literal(CardType.MASKED),
});

/**
 * ゲームで使われるカード実体情報 (ユニオン)
 */
export type CardState =
  | UnitCardState
  | SpellCardState
  | WeaponCardState
  | HeroCardState
  | BuildingCardState
  | TentionSkillCardState
  | HeroSkillCardState;
export const zCardState = z.discriminatedUnion('type', [
  zUnitCardState,
  zSpellCardState,
  zWeaponCardState,
  zHeroCardState,
  zBuildingCardState,
  zTentionSkillCardState,
  zHeroSkillCardState,
]);

/**
 * ドローしたカード情報
 *
 * 通常のカード種別に加えて、マスク状態の MaskedCardState や山札切れを表す FatigueCardState も含まれる。
 */
export type DrawnCardState = CardState | MaskedCardState | FatigueCardState;
export const zDrawnCardState = z.union([zCardState, zMaskedCardState, zFatigueCardState]);

/**
 * 装備中の武器情報
 */
export type EquippedWeaponState = {
  /** 装備中武器の実体ID */
  id: Id;
  /** 武器の定義ID */
  weaponDefId: Id;
  /** 武器装備者 */
  owner: LeaderPosition;
  /** 攻撃力 */
  basePower: number;
  /** 耐久力 */
  durability: number;
};
export const zEquippedWeaponState = z.object({
  id: zId,
  weaponDefId: zId,
  owner: zLeaderPosition,
  basePower: zStat,
  durability: zStat,
});

/**
 * 効果量などを記録するストレージ
 */
export type Storage = Record<string, string | number | boolean | null>;
export const zStorage = z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]));

/**
 * フィールド地形の状態
 */
export interface FloorState<TStorage extends Storage | null = Storage | null> {
  /** 地形実体ID */
  readonly id: Id;
  /** 地形定義ID */
  readonly floorDefId: Id;
  /** 地形所有者 */
  readonly owner: LeaderPosition;
  /** 効果量などを記録するストレージ */
  readonly storage: TStorage;
}
export const zFloorState = z.object({
  id: zId,
  floorDefId: zId,
  owner: zLeaderPosition,
  storage: zStorage.nullable(),
});

/**
 * バッジ効果の状態
 */
export interface BadgeState<TStorage extends Storage | null = Storage | null> {
  /** バッジ実体ID */
  readonly id: Id;
  /** バッジ定義ID */
  readonly badgeDefId: Id;
  /** バッジ所有者 */
  readonly owner: LeaderPosition;
  /** 効果量などを記録するストレージ */
  readonly storage: TStorage;
}
export const zBadgeState = z.object({
  id: zId,
  badgeDefId: zId,
  owner: zLeaderPosition,
  storage: zStorage.nullable(),
});

/**
 * 持続効果の状態
 */
export interface EffectState<TStorage extends Storage | null = Storage | null> {
  /** 持続効果の実体ID */
  readonly id: Id;
  /** 持続効果の定義ID */
  readonly effectDefId: Id;
  /** 持続効果所有者 */
  readonly owner: LeaderPosition;
  /** 持続効果の対象 */
  readonly target?: EffectTarget;
  /** 持続効果のソース */
  readonly source: EffectSource;
  /** 持続効果の終了タイミング (未指定の場合は永続) */
  readonly endTiming?: EffectEndTiming;
  /** 効果量などを記録するストレージ */
  readonly storage: TStorage;
}
export const zEffectState = z.object({
  id: zId,
  effectDefId: zId,
  owner: zLeaderPosition,
  target: zEffectTarget,
  source: zEffectSource,
  endTiming: zEffectEndTiming.optional(),
  storage: zStorage.nullable(),
});

/**
 * フィールドに出ているユニットの実体情報
 *
 * 基礎スタッツとバフの関係が非常にややこしい。現在のスタッツは基礎スタッツ＋バフで計算される。
 * 基礎スタッツはフィールドに出た時点でカード実体から設定されるもので、一切変動しない。
 * 一方のバフは、商人の種のような永続的なものと、クイーンスライムのような一時的なものがある。
 *
 * 問題は、スタッツが強制変化される場合であり、例えば愚者のタロットによって 1/1 にされる場合
 * バフを無視して強制的に 1/1 にする必要がある。その後にクイーンスライムが死亡しても 0/0 になったりしないし
 * 1/1 になったユニットに対して新たにバフをする事もできる、という仕様になっている。
 *
 * 要するにカード効果は後から出した方が優先されるので、バフやスタッツ修正はすべて EffectState で管理する事とし
 * 基礎スタッツに対して EffectState を順番に適用していくことで、最終的なスタッツが求まる、という形とする。
 */
export interface FieldUnitState {
  readonly type: 'UNIT';
  /** フィールドユニットの実体ID */
  readonly id: Id;
  /** ユニットの定義ID */
  readonly unitDefId: Id;
  /** 所有者 */
  readonly owner: LeaderPosition;
  /** 基礎攻撃力 */
  readonly basePower: number;
  /** 基礎最大HP */
  readonly baseMaxHP: number;
  /** 現在HP */
  readonly currentHP: number;
  /** 呼び出されたターン */
  readonly summonedTurn: number;
  /** ターン中に攻撃した回数 */
  readonly turnAttackCount: number;
}
export const zFieldUnitState = z.object({
  type: z.literal('UNIT'),
  id: zId,
  unitDefId: zId,
  owner: zLeaderPosition,
  basePower: zStat,
  baseMaxHP: zMaxStat,
  currentHP: zStat,
  summonedTurn: z.number().int().min(1),
  turnAttackCount: zStat,
});

/**
 * フィールドに出ている建物の実体
 */
export interface FieldBuildingState {
  readonly type: 'BUILDING';
  /** フィールド建物の実体ID */
  readonly id: Id;
  /** 建物の定義ID */
  readonly buildingDefId: Id;
  /** 所有者 */
  readonly owner: LeaderPosition;
  /** 耐久力 */
  readonly durability: number;
}
export const zFieldBuildingState = z.object({
  type: z.literal('BUILDING'),
  id: zId,
  buildingDefId: zId,
  owner: zLeaderPosition,
  durability: zStat,
});

/**
 * フィールドに出ているオブジェクトの実体情報 (ユニオン)
 *
 * オブジェクト実体は、ユニットカードや建物カード使用時に作成されフィールドに配置される。
 * カード実体 (GameCard) とは別物なので注意。
 */
export type FieldObjectState = FieldUnitState | FieldBuildingState;
export const zFieldObjectState = z.union([zFieldUnitState, zFieldBuildingState]);

/**
 * フィールドに出ているオブジェクトの種別
 */
export type FieldObjectType = FieldObjectState['type'];

/**
 * ゲーム中のフィールド情報
 */
export type FieldState = {
  /** フィールド地形の定義IDマップ */
  floorMap: Partial<Record<CellPosition, FloorState>>;
  /** フィールドに出ているオブジェクト状態のマップ (ユニットまたは建物) */
  objectMap: Partial<Record<CellPosition, FieldObjectState>>;
};
export const zFieldState = z.object({
  floorMap: z.record(zCellPosition, zFloorState),
  objectMap: z.record(zCellPosition, zFieldObjectState),
});

/**
 * ゲーム中のプレイヤーの状態
 */
export type PlayerState = {
  /** 位置 */
  position: LeaderPosition;
  /** 最大 HP */
  maxHP: number;
  /** 残り HP */
  currentHP: number;
  /** 最大 MP */
  maxMP: number;
  /** 残り MP */
  currentMP: number;
  /** テンション数 */
  tentionCount: number;
  /** 手札 */
  hand: CardState[];
  /** 山札にあるカードセット */
  library: CardState[];
  /** テンションスキルカード実体 */
  tentionSkill: TentionSkillCardState | null;
  /** ヒーロースキルカード実体 */
  heroSkill: HeroSkillCardState | null;
  /** 有効なパワフルバッジの実体列 (重複あり) */
  badges: BadgeState[];
  /** 装備中の武器 */
  weapon: EquippedWeaponState | null;
  /** このゲーム中にテンションスキルを撃った回数 */
  tentionSkillCount: number;
  /** ファティーグダメージを受けた回数 */
  fatigueCount: number;
  /** 熟練度基礎値 */
  baseProficiency: number;
  /** このゲーム中 攻撃した回数 */
  attackCount: number;
  /** このターン中 攻撃した回数 (ターン毎に 0 にリセットされる) */
  turnAttackCount: number;
  /** 死亡したユニットのカード定義ID列 (重複あり) */
  deadUnitDefIds: Id[];
  /** 使用したカード定義ID列 (重複あり) */
  usedCardDefIds: Id[];
};
export const zPlayerState = z.object({
  position: zLeaderPosition,
  maxHP: zMaxStat,
  currentHP: zStat,
  maxMP: zMaxStat,
  currentMP: zStat,
  tentionCount: z.number().int().min(0).max(MAX_TENTION),
  hand: z.array(zCardState),
  library: z.array(zCardState),
  tentionSkill: zTentionSkillCardState.nullable(),
  heroSkill: zHeroSkillCardState.nullable(),
  badges: z.array(zBadgeState),
  weapon: zEquippedWeaponState.nullable(),
  tentionSkillCount: z.number().int().min(0),
  fatigueCount: z.number().int().min(0),
  baseProficiency: z.number().int().min(0),
  attackCount: z.number().int().min(0),
  turnAttackCount: z.number().int().min(0),
  deadUnitDefIds: z.array(zId),
  usedCardDefIds: z.array(zId),
});

/**
 * ゲームの状態 (State)
 *
 * State はイミュータブルなオブジェクトであり、中に他 State 以外の参照は含まず、JSON としてシリアライズ可能にする。
 * State 同士の差分を取る事で状態の変化を調べる事ができるようにする。
 */
export type GameState = {
  /** 現在のターン番号 */
  turn: number;
  /** 現在のターンの終了予定日時 (エポック秒) */
  turnWillEndAt: number | null;
  /** マリガンした手札番号 */
  mulliganSwapped: Partial<Record<LeaderPosition, HandIndex[]>>;
  /** ターン進行中のプレイヤー番号 */
  activeLeader: LeaderPosition;
  /** プレイヤーの状態 */
  playerMap: Record<LeaderPosition, PlayerState>;
  /** フィールドの状態 */
  field: FieldState;
  /** 持続効果 */
  effects: EffectState[];
  /** ゲーム終了済みかどうか */
  isFinished: boolean;
  /** ゲーム勝者 (isFinished = true かつ winner = null の場合はドロー) */
  winner: LeaderPosition | null;
};
export const zGameState = z.object({
  turn: z.number().int().min(1),
  turnWillEndAt: z.number().int().nullable(),
  mulliganSwapped: zLeaderMap(z.array(zHandIndex).optional()),
  activeLeader: zLeaderPosition,
  playerMap: zLeaderMap(zPlayerState),
  field: zFieldState,
  effects: z.array(zEffectState),
  isFinished: z.boolean(),
  winner: zLeaderPosition.nullable(),
});
