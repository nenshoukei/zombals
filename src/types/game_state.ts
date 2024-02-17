import { z } from 'zod';
import { CardType, Id, zHandIndex, zId, zMaxStat, zStat } from './common';
import {
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
import { schemaForType } from '@/utils/zod_utils';

/**
 * ゲームで使われるカード実体情報の共通部分
 */
const zCardStateBase = z.object({
  /** 実体カードID (1ゲーム内ごとに1から始まる連番) */
  id: zId,
  /** カード定義参照ID */
  cardDefId: zId,
  /** カード所有者 */
  owner: zLeaderPosition,
  /** MPコスト */
  cost: zStat,
  /** トークンかどうか (コピーの場合も true になる) */
  isToken: z.boolean().optional(),
  /** 熟練度 増分 */
  proficiencyPlus: z.number().int().min(0),
});

/**
 * ユニットカードの実体
 */
export type UnitCardState = z.infer<typeof zUnitCardState>;
export const zUnitCardState = zCardStateBase.extend({
  /** カード種別 */
  type: z.literal(CardType.UNIT),
  /** 攻撃力 */
  power: zStat,
  /** 最大HP */
  maxHP: zMaxStat,
  /** 石化状態かどうか */
  isStoned: z.boolean().optional(),
});

/**
 * 特技カードの実体
 */
export type SpellCardState = z.infer<typeof zSpellCardState>;
export const zSpellCardState = zCardStateBase.extend({
  /** カード種別 */
  type: z.literal(CardType.SPELL),
});

/**
 * 武器カードの実体
 */
export type WeaponCardState = z.infer<typeof zWeaponCardState>;
export const zWeaponCardState = zCardStateBase.extend({
  /** カード種別 */
  type: z.literal(CardType.WEAPON),
  /** 攻撃力 */
  power: zStat,
  /** 耐久力 */
  durability: zStat,
});

/**
 * 英雄カードの実体
 */
export type HeroCardState = z.infer<typeof zHeroCardState>;
export const zHeroCardState = zCardStateBase.extend({
  /** カード種別 */
  type: z.literal(CardType.HERO),
});

/**
 * 建物カードの実体
 */
export type BuildingCardState = z.infer<typeof zBuildingCardState>;
export const zBuildingCardState = zCardStateBase.extend({
  /** カード種別 */
  type: z.literal(CardType.BUILDING),
});

/**
 * テンションスキルカードの実体
 */
export type TentionSkillCardState = z.infer<typeof zTentionSkillCardState>;
export const zTentionSkillCardState = zCardStateBase.extend({
  /** カード種別 */
  type: z.literal(CardType.TENTION_SKILL),
});

/**
 * ヒーロースキルカードの実体
 */
export type HeroSkillCardState = z.infer<typeof zHeroSkillCardState>;
export const zHeroSkillCardState = zCardStateBase.extend({
  /** カード種別 */
  type: z.literal(CardType.HERO_SKILL),
});

/**
 * 山札のカードが切れている時にドローした際に渡されるカード
 *
 * ファティーグダメージを受ける。
 *
 * 実体カードではないので ID を持たない。
 */
export type FatigueCardState = z.infer<typeof zFatigueCardState>;
export const zFatigueCardState = z.object({
  /** カード種別 */
  type: z.literal(CardType.FATIGUE),
});

/**
 * マスク状態カード
 *
 * 対戦相手がドローしたり手札に加えたりするカードはマスク状態になる。
 *
 * 実体カードではないので ID を持たない。
 */
export type MaskedCardState = z.infer<typeof zMaskedCardState>;
export const zMaskedCardState = z.object({
  /** カード種別 */
  type: z.literal(CardType.MASKED),
});

/**
 * ゲームで使われるカード実体情報 (ユニオン)
 */
export type CardState = z.infer<typeof zCardState>;
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
export type DrawnCardState = z.infer<typeof zDrawnCardState>;
export const zDrawnCardState = z.union([zCardState, zMaskedCardState, zFatigueCardState]);

/**
 * 装備中の武器情報
 */
export type EquippedWeaponState = z.infer<typeof zEquippedWeaponState>;
export const zEquippedWeaponState = z.object({
  /** 装備中武器の実体ID */
  id: zId,
  /** 武器の定義ID */
  weaponDefId: zId,
  /** 武器装備者 */
  owner: zLeaderPosition,
  /** 攻撃力 */
  basePower: zStat,
  /** 耐久力 */
  durability: zStat,
});

/**
 * 効果量などを記録するストレージ
 */
export type Storage = z.infer<typeof zStorage>;
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
export const zFloorState = schemaForType<FloorState>(
  z.object({
    id: zId,
    floorDefId: zId,
    owner: zLeaderPosition,
    storage: zStorage.nullable(),
  }),
);

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
export const zBadgeState = schemaForType<BadgeState>(
  z.object({
    id: zId,
    badgeDefId: zId,
    owner: zLeaderPosition,
    storage: zStorage.nullable(),
  }),
);

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
export const zEffectState = schemaForType<EffectState>(
  z.object({
    id: zId,
    effectDefId: zId,
    owner: zLeaderPosition,
    target: zEffectTarget,
    source: zEffectSource,
    endTiming: zEffectEndTiming.optional(),
    storage: zStorage.nullable(),
  }),
);

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
  /** ターン中に攻撃した回数 */
  readonly turnAttackCount: number;
}
export const zFieldUnitState = schemaForType<FieldUnitState>(
  z.object({
    type: z.literal('UNIT'),
    id: zId,
    unitDefId: zId,
    owner: zLeaderPosition,
    basePower: zStat,
    baseMaxHP: zMaxStat,
    currentHP: zStat,
    turnAttackCount: zStat,
  }),
);

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
export const zFieldBuildingState = schemaForType<FieldBuildingState>(
  z.object({
    type: z.literal('BUILDING'),
    id: zId,
    buildingDefId: zId,
    owner: zLeaderPosition,
    durability: zStat,
  }),
);

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
export type FieldState = z.infer<typeof zFieldState>;
export const zFieldState = z.object({
  /** フィールド地形の定義IDマップ */
  floorMap: z.record(zCellPosition, zFloorState),
  /** フィールドに出ているオブジェクト状態のマップ (ユニットまたは建物) */
  objectMap: z.record(zCellPosition, zFieldObjectState),
});

/**
 * ゲーム中のプレイヤーの状態
 */
export type PlayerState = z.infer<typeof zPlayerState>;
export const zPlayerState = z
  .object({
    /** 位置 */
    position: zLeaderPosition,
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
    /** 手札 */
    hand: z.array(zCardState),
    /** 山札にあるカードセット */
    library: z.array(zCardState),
    /** テンションスキルカード実体 */
    tentionSkill: zTentionSkillCardState.nullable(),
    /** ヒーロースキルカード実体 */
    heroSkill: zHeroSkillCardState.nullable(),
    /** 有効なパワフルバッジの実体列 (重複あり) */
    badges: z.array(zBadgeState),
    /** 装備中の武器 */
    weapon: zEquippedWeaponState.nullable(),
    /** このゲーム中にテンションスキルを撃った回数 */
    tentionSkillCount: z.number().int().min(0),
    /** ファティーグダメージを受けた回数 */
    fatigueCount: z.number().int().min(0),
    /** 熟練度基礎値 */
    baseProficiency: z.number().int().min(0),
    /** このゲーム中 攻撃した回数 */
    attackCount: z.number().int().min(0),
    /** このターン中 攻撃した回数 (ターン毎に 0 にリセットされる) */
    turnAttackCount: z.number().int().min(0),
    /** 死亡したユニットのカード定義ID列 (重複あり) */
    deadUnitDefIds: z.array(zId),
    /** 使用したカード定義ID列 (重複あり) */
    usedCardDefIds: z.array(zId),
  })
  .readonly();

/**
 * ゲームの状態 (State)
 *
 * State はイミュータブルなオブジェクトであり、中に他 State 以外の参照は含まず、JSON としてシリアライズ可能にする。
 * State 同士の差分を取る事で状態の変化を調べる事ができるようにする。
 */
export type GameState = z.infer<typeof zGameState>;
export const zGameState = z
  .object({
    /** 現在のターン番号 */
    turnNumber: z.number().int().min(1),
    /** 現在のターンの終了予定日時 (エポック秒) */
    turnWillEndAt: z.number().int().nullable(),
    /** マリガンした手札番号 */
    mulliganSwapped: zLeaderMap(z.array(zHandIndex).optional()),
    /** ターン進行中のプレイヤー番号 */
    activeLeader: zLeaderPosition,
    /** プレイヤーの状態 */
    playerMap: zLeaderMap(zPlayerState),
    /** フィールドの状態 */
    field: zFieldState,
    /** 持続効果 */
    effects: z.array(zEffectState),
    /** ゲーム終了済みかどうか */
    isFinished: z.boolean(),
    /** ゲーム勝者 (isFinished = true かつ winner = null の場合はドロー) */
    winner: zLeaderPosition.nullable(),
  })
  .readonly();
