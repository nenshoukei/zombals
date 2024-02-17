/*
 * # フィールド
 *
 * Position 表記
 * AL, BL - リーダー (Leader)
 * An, Bn - マス (Cell)
 * ROWn - 横行 (Row)
 * COLn - 縦列 (Column)
 * AROWn, BROWn - 片側横行 (SideRow)
 *
 *       COL3 COL1    COL2 COL4
 *      +----+----+  +----+----+
 * +----+ A4 | A1 |  | B1 | B4 +----+  ROW1
 * |    +----+----+  +----+----+    |
 * | AL | A5 | A2 |  | B2 | B5 | BL |  ROW2
 * |    +----+----+  +----+----+    |
 * +----+ A6 | A3 |  | B3 | B6 +----+  ROW3
 *      +----+----+  +----+----+
 *
 *      +----+----+  +----+----+
 * +----+  AROW1  |  |  BROW1  +----+
 * |    +----+----+  +----+----+    |
 * | AL |  AROW2  |  |  BROW2  | BL |
 * |    +----+----+  +----+----+    |
 * +----+  AROW3  |  |  BROW3  +----+
 *      +----+----+  +----+----+
 *
 * - ゲーム開始時に両方のプレイヤーにそれぞれ AL, BL が割り振られる。それらはゲーム中に変化しない。
 * - フィールドを表示する際、もし視点となっているプレイヤーが BL だったら A と B の表示位置を入れ替える。
 *   これにより、常に左側に視点プレイヤーが来るようにする。
 * - フィールド全体におけるマスの番号は 0 => A1, 1 => B1, 2 => A2, 3 => B2, ...., 11 => B6 の順番で割り振り。
 *   この順番は効果処理順などに適用される。
 */

import { z } from 'zod';
import { zId } from './common';

/** 両方のリーダー */
export const LEADERS = ['AL', 'BL'] as const;
/** 全てのセル */
export const CELLS = ['A1', 'B1', 'A2', 'B2', 'A3', 'B3', 'A4', 'B4', 'A5', 'B5', 'A6', 'B6'] as const;
/** 両方のリーダーと全てのセル */
export const LEADERS_AND_CELLS = [...LEADERS, ...CELLS] as const;
/** 全ての横行 */
export const ROWS = ['ROW1', 'ROW2', 'ROW3'] as const;
/** 全ての縦列 */
export const COLUMNS = ['COL1', 'COL2', 'COL3', 'COL4'] as const;
/** 全ての片側横行 */
export const SIDE_ROWS = ['AROW1', 'BROW1', 'AROW2', 'BROW2', 'AROW3', 'BROW3'] as const;

/** リーダーの位置 (AL, BL) */
export type LeaderPosition = z.infer<typeof zLeaderPosition>;
export const zLeaderPosition = z.enum(LEADERS);
export const zLeaderMap = <T extends z.ZodSchema>(schema: T) => z.object({ [LEADERS[0]]: schema, [LEADERS[1]]: schema });
/** マスの位置 (A1, B1, A2, ...) */
export type CellPosition = z.infer<typeof zCellPosition>;
export const zCellPosition = z.enum(CELLS);
// 単に z.record だけだと value が全て optional になってしまうので workaround...
export const zCellMap = <T extends z.ZodSchema>(schema: T) =>
  z.record(zCellPosition, schema).transform((x) => x as typeof x extends Partial<infer T> ? T : never);
/** リーダーまたはマスの位置 (AL, BL, A1, B1, A2, ...) */
export type LeaderCellPosition = z.infer<typeof zLeaderCellPosition>;
export const zLeaderCellPosition = z.enum([...LEADERS, ...CELLS]);
/** 横行の位置 (ROWn) */
export type RowPosition = z.infer<typeof zRowPosition>;
export const zRowPosition = z.enum(ROWS);
/** 縦列の位置 (COLn) */
export type ColumnPosition = z.infer<typeof zColumnPosition>;
export const zColumnPosition = z.enum(COLUMNS);
/** 片側横行の位置 (AROWn, BROWn) */
export type SideRowPosition = z.infer<typeof zSideRowPosition>;
export const zSideRowPosition = z.enum(SIDE_ROWS);
/** 縦列が前列か後列か */
export type ColumnType = 'FRONT' | 'BACK';

/**
 * 片側視点の位置リスト
 */
export interface SidePositionList {
  /** 味方リーダーの位置 */
  readonly allyLeader: LeaderPosition;
  /** 味方側の全てのセル */
  readonly allyCells: Readonly<[CellPosition, ...CellPosition[]]>;
  /** 味方リーダーと味方側の全てのセル */
  readonly allyLeaderAndCells: Readonly<[LeaderPosition, ...CellPosition[]]>;
  /** 味方側の全ての縦列 */
  readonly allyColumns: Readonly<[ColumnPosition, ...ColumnPosition[]]>;
  /** 味方側の全ての片側横列 */
  readonly allySideRows: Readonly<[SideRowPosition, ...SideRowPosition[]]>;

  /** 敵リーダー */
  readonly enemyLeader: LeaderPosition;
  /** 敵側の全てのセル */
  readonly enemyCells: Readonly<[CellPosition, ...CellPosition[]]>;
  /** 敵リーダーと敵側の全てのセル */
  readonly enemyLeaderAndCells: Readonly<[LeaderPosition, ...CellPosition[]]>;
  /** 敵側の全ての縦列 */
  readonly enemyColumns: Readonly<[ColumnPosition, ...ColumnPosition[]]>;
  /** 敵側の全ての片側横列 */
  readonly enemySideRows: Readonly<[SideRowPosition, ...SideRowPosition[]]>;
}

const CELLS_A = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'] as const;
const CELLS_B = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'] as const;

/**
 * 片側視点の位置リスト
 */
export const BY_LEADER: Readonly<Record<LeaderPosition, SidePositionList>> = {
  AL: {
    allyLeader: 'AL',
    allyCells: CELLS_A,
    allyLeaderAndCells: ['AL', ...CELLS_A],
    allyColumns: ['COL1', 'COL3'],
    allySideRows: ['AROW1', 'AROW2', 'AROW3'],

    enemyLeader: 'BL',
    enemyCells: CELLS_B,
    enemyLeaderAndCells: ['BL', ...CELLS_B],
    enemyColumns: ['COL2', 'COL4'],
    enemySideRows: ['BROW1', 'BROW2', 'BROW3'],
  },
  BL: {
    allyLeader: 'BL',
    allyCells: CELLS_B,
    allyLeaderAndCells: ['BL', ...CELLS_B],
    allyColumns: ['COL2', 'COL4'],
    allySideRows: ['BROW1', 'BROW2', 'BROW3'],

    enemyLeader: 'AL',
    enemyCells: CELLS_A,
    enemyLeaderAndCells: ['AL', ...CELLS_A],
    enemyColumns: ['COL1', 'COL3'],
    enemySideRows: ['AROW1', 'AROW2', 'AROW3'],
  },
} as const;

/**
 * セル位置からリーダー位置への変換マップ
 *
 * ```
 * CELL_TO_LEADER.A1 === 'A'
 * CELL_TO_LEADER.B3 === 'B'
 * ```
 */
export const CELL_TO_LEADER = Object.fromEntries([
  ...CELLS_A.map((cell) => [cell, 'A']),
  ...CELLS_B.map((cell) => [cell, 'B']),
]) as Readonly<Record<CellPosition, LeaderPosition>>;

/**
 * セル位置から横行位置への変換マップ
 *
 * ```
 * CELL_TO_ROW.A1 === 'ROW1'
 * CELL_TO_ROW.B5 === 'ROW2'
 * ```
 */
export const CELL_TO_ROW = Object.fromEntries([
  ...CELLS_A.map((cell, index) => [cell, ROWS[index % ROWS.length]]),
  ...CELLS_B.map((cell, index) => [cell, ROWS[index % ROWS.length]]),
]) as Readonly<Record<CellPosition, RowPosition>>;

/**
 * セル位置から縦列位置への変換マップ
 *
 * ```
 * CELL_TO_COLUMN.A1 === 'COL1'
 * CELL_TO_COLUMN.B5 === 'COL4'
 * ```
 */
export const CELL_TO_COLUMN = Object.fromEntries([
  ...CELLS_A.map((cell, index) => [cell, COLUMNS[Math.floor(index / ROWS.length) * 2]]),
  ...CELLS_B.map((cell, index) => [cell, COLUMNS[Math.floor(index / ROWS.length) * 2 + 1]]),
]) as Readonly<Record<CellPosition, ColumnPosition>>;

/**
 * セル位置から片側横行位置への変換マップ
 *
 * ```
 * CELL_TO_SIDE_ROW.A1 === 'AROW1'
 * CELL_TO_SIDE_ROW.B5 === 'BROW2'
 * ```
 */
export const CELL_TO_SIDE_ROW = Object.fromEntries([
  ...CELLS_A.map((cell, index) => [cell, 'A' + ROWS[index % ROWS.length]]),
  ...CELLS_B.map((cell, index) => [cell, 'B' + ROWS[index % ROWS.length]]),
]) as Readonly<Record<CellPosition, SideRowPosition>>;

/**
 * セル位置から前後列逆位置への変換マップ
 *
 * ```
 * CELL_TO_OPPOSITE_CELL.A1 === 'A4'
 * CELL_TO_OPPOSITE_CELL.B5 === 'B2'
 * ```
 */
export const CELL_TO_OPPOSITE_CELL = Object.fromEntries([
  ...CELLS.map((cell, index) => [cell, CELLS[(index + SIDE_ROWS.length) % CELLS.length]]),
]) as Readonly<Record<CellPosition, CellPosition>>;

/**
 * セルが前列か後列か変換するマップ
 *
 * ```
 * CELL_TO_COLUMN_TYPE.A1 === 'FRONT'
 * CELL_TO_COLUMN_TYPE.B5 === 'BACK'
 * ```
 */
export const CELL_TO_COLUMN_TYPE = Object.fromEntries([
  ...CELLS.slice(0, CELLS.length / 2).map((cell) => [cell, 'FRONT']),
  ...CELLS.slice(CELLS.length / 2).map((cell) => [cell, 'BACK']),
]) as Readonly<Record<CellPosition, ColumnType>>;

/**
 * 縦列位置からセルのリストへの変換マップ
 *
 * ```
 * COLUMN_TO_CELLS.COL1 == ['A1', 'A2', 'A3']
 * COLUMN_TO_CELLS.COL2 == ['B1', 'B2', 'B3']
 * ```
 */
export const COLUMN_TO_CELLS = {
  COL1: ['A1', 'A2', 'A3'],
  COL2: ['B1', 'B2', 'B3'],
  COL3: ['A4', 'A5', 'A6'],
  COL4: ['B4', 'B5', 'B6'],
} as Readonly<Record<ColumnPosition, [CellPosition, CellPosition, CellPosition]>>;

/**
 * 縦列位置が前列か後列か変換するマップ
 *
 * ```
 * COLUMN_TO_TYPE.COL1 === 'FRONT'
 * COLUMN_TO_TYPE.COL4 === 'BACK'
 * ```
 */
export const COLUMN_TO_TYPE = {
  COL1: 'FRONT',
  COL2: 'FRONT',
  COL3: 'BACK',
  COL4: 'BACK',
} as Readonly<Record<ColumnPosition, ColumnType>>;

/**
 * 片側横行位置から2つのセルのペアへの変換マップ
 *
 * ```
 * SIDE_ROW_TO_CELLS.AROW1 == ['A1', 'A4']
 * SIDE_ROW_TO_CELLS.BROW2 == ['B2', 'B5']
 * ```
 */
export const SIDE_ROW_TO_CELLS = {
  AROW1: ['A1', 'A4'],
  BROW1: ['B1', 'B4'],
  AROW2: ['A2', 'A5'],
  BROW2: ['B2', 'B5'],
  AROW3: ['A3', 'A6'],
  BROW3: ['B3', 'B6'],
} as Readonly<Record<SideRowPosition, [CellPosition, CellPosition]>>;

/**
 * 対象選択の種別
 */
export enum TargetType {
  /** リーダーを対象 */
  LEADER = 'LEADER',
  /** ユニットを対象 */
  UNIT = 'UNIT',
  /** 建物を対象 */
  BUILDING = 'BUILDING',
  /** 地形を対象 */
  FLOOR = 'FLOOR',
  /** 1マスを対象 */
  CELL = 'CELL',
  /** 横1行を対象 */
  ROW = 'ROW',
  /** 縦1列を対象 */
  COLUMN = 'COLUMN',
  /** 片側横1行を対象 */
  SIDE_ROW = 'SIDE_ROW',
  /** 装備武器を対象 */
  EQUIP_WEAPON = 'EQUIP_WEAPON',
  /** パワフルバッジを対象 */
  BADGE = 'BADGE',
}

/**
 * リーダーを対象とする場合の選択情報
 */
export type TargetLeader = z.infer<typeof zTargetLeader>;
export const zTargetLeader = z.object({
  type: z.literal(TargetType.LEADER),
  position: zLeaderPosition,
});

/**
 * フィールドユニットを対象とする場合の選択情報
 */
export type TargetUnit = z.infer<typeof zTargetUnit>;
export const zTargetUnit = z.object({
  type: z.literal(TargetType.UNIT),
  unitId: zId,
});

/**
 * フィールド建物を対象とする場合の選択情報
 */
export type TargetBuilding = z.infer<typeof zTargetBuilding>;
export const zTargetBuilding = z.object({
  type: z.literal(TargetType.BUILDING),
  buildingId: zId,
});

/**
 * フィールド地形を対象とする場合の選択情報
 */
export type TargetFloor = z.infer<typeof zTargetFloor>;
export const zTargetFloor = z.object({
  type: z.literal(TargetType.FLOOR),
  floorId: zId,
});

/**
 * 1マスを対象とする場合の選択情報
 */
export type TargetCell = z.infer<typeof zTargetCell>;
export const zTargetCell = z.object({
  type: z.literal(TargetType.CELL),
  position: zCellPosition,
});

/**
 * 横1行を対象とする場合の選択情報
 */
export type TargetRow = z.infer<typeof zTargetRow>;
export const zTargetRow = z.object({
  type: z.literal(TargetType.ROW),
  position: zRowPosition,
});

/**
 * 縦1列を対象とする場合の選択情報
 */
export type TargetColumn = z.infer<typeof zTargetColumn>;
export const zTargetColumn = z.object({
  type: z.literal(TargetType.COLUMN),
  position: zColumnPosition,
});

/**
 * 片側の横1行を対象とする場合の選択情報
 */
export type TargetSideRow = z.infer<typeof zTargetSideRow>;
export const zTargetSideRow = z.object({
  type: z.literal(TargetType.SIDE_ROW),
  position: zSideRowPosition,
});

/**
 * 装備武器を対象とする場所の選択情報
 */
export type TargetEquipWeapon = z.infer<typeof zTargetEquipWeapon>;
export const zTargetEquipWeapon = z.object({
  type: z.literal(TargetType.EQUIP_WEAPON),
  weaponId: zId,
});

/**
 * パワフルバッジを対象とする選択情報
 */
export type TargetBadge = z.infer<typeof zTargetBadge>;
export const zTargetBadge = z.object({
  type: z.literal(TargetType.BADGE),
  badgeId: zId,
});

/**
 * 対象選択情報ユニオン
 */
export type Target = z.infer<typeof zTarget>;
export const zTarget = z.discriminatedUnion('type', [
  zTargetLeader,
  zTargetUnit,
  zTargetBuilding,
  zTargetFloor,
  zTargetCell,
  zTargetRow,
  zTargetColumn,
  zTargetSideRow,
  zTargetEquipWeapon,
  zTargetBadge,
]);

/**
 * 同じ対象かどうかを判定する
 */
export function isSameTarget(target1: Target, target2: Target): boolean {
  if (target1.type !== target2.type) return false;

  switch (target1.type) {
    case TargetType.UNIT:
      return target1.unitId === (target2 as TargetUnit).unitId;
    case TargetType.BUILDING:
      return target1.buildingId === (target2 as TargetBuilding).buildingId;
    case TargetType.FLOOR:
      return target1.floorId === (target2 as TargetFloor).floorId;
    case TargetType.EQUIP_WEAPON:
      return target1.weaponId === (target2 as TargetEquipWeapon).weaponId;
    case TargetType.BADGE:
      return target1.badgeId === (target2 as TargetBadge).badgeId;
    default:
      return target1.position === (target2 as typeof target1).position;
  }
}

/**
 * 持続効果対象の種別
 */
export type EffectTargetType = (typeof EffectTargetType)[keyof typeof EffectTargetType];
export const EffectTargetType = {
  /** リーダーを対象 */
  LEADER: TargetType.LEADER,
  /** ユニットを対象 */
  UNIT: TargetType.UNIT,
  /** 地形を対象 */
  FLOOR: TargetType.FLOOR,
} as const;

/**
 * 持続効果の対象ユニオン
 */
export type EffectTarget = z.infer<typeof zEffectTarget>;
export const zEffectTarget = z.discriminatedUnion('type', [zTargetLeader, zTargetUnit, zTargetFloor]);

/**
 * 持続効果ソースの種別
 */
export type EffectSourceType = (typeof EffectSourceType)[keyof typeof EffectSourceType];
export const EffectSourceType = {
  /** リーダーやリーダーが使った特技・スキルが元 */
  LEADER: TargetType.LEADER,
  /** ユニットが元 */
  UNIT: TargetType.UNIT,
  /** 建物が元 */
  BUILDING: TargetType.BUILDING,
  /** 地形が元 */
  FLOOR: TargetType.FLOOR,
  /** 装備武器が元 */
  EQUIP_WEAPON: TargetType.EQUIP_WEAPON,
  /** パワフルバッジが元 */
  BADGE: TargetType.BADGE,
} as const;

/**
 * 持続効果ソースユニオン
 */
export type EffectSource = z.infer<typeof zEffectSource>;
export const zEffectSource = z.discriminatedUnion('type', [
  zTargetLeader,
  zTargetUnit,
  zTargetBuilding,
  zTargetFloor,
  zTargetEquipWeapon,
  zTargetBadge,
]);

/**
 * 持続効果の終了タイミング
 */
export enum EffectEndTimingType {
  /** 指定プレイヤーのターン終了まで */
  AT_TURN_END = 'AT_TURN_END',
}

/**
 * 指定プレイヤーのターン終了時まで
 */
export type EffectEndTimingAtTurnEnd = z.infer<typeof zEffectEndTimingAtTurnEnd>;
export const zEffectEndTimingAtTurnEnd = z.object({
  type: z.literal(EffectEndTimingType.AT_TURN_END),
  leader: zLeaderPosition,
});

/**
 * 持続効果の終了タイミング情報ユニオン
 */
export type EffectEndTiming = z.infer<typeof zEffectEndTiming>;
export const zEffectEndTiming = z.discriminatedUnion('type', [zEffectEndTimingAtTurnEnd]);

/**
 * 攻撃・特技使用・スキル使用対象ユニオン
 */
export type AttackTarget = z.infer<typeof zAttackTarget>;
export const zAttackTarget = z.discriminatedUnion('type', [zTargetLeader, zTargetUnit]);

/**
 * ダメージソース（もしくは回復ソース）の種別
 */
export enum DamageSourceType {
  /** リーダーの攻撃や装備武器の効果など */
  LEADER = 'LEADER',
  /** フィールドユニットの攻撃や効果など */
  UNIT = 'UNIT',
  /** 特技カード */
  SPELL = 'SPELL',
  /** テンションスキル */
  TENTION_SKILL = 'TENTION_SKILL',
  /** ヒーロースキル */
  HERO_SKILL = 'HERO_SKILL',
}

/**
 * リーダーの攻撃や装備武器の効果などによって発生した攻撃ソース
 */
export type DamageSourceLeader = z.infer<typeof zDamageSourceLeader>;
export const zDamageSourceLeader = z.object({
  type: z.literal(DamageSourceType.LEADER),
  /** 攻撃や効果などを発生させたリーダー位置 */
  position: zLeaderPosition,
});

/**
 * フィールドユニットの攻撃や効果などによって発生したソース
 */
export type DamageSourceUnit = z.infer<typeof zDamageSourceUnit>;
export const zDamageSourceUnit = z.object({
  type: z.literal(DamageSourceType.UNIT),
  /** 攻撃や効果などを発生させたユニット位置 */
  position: zCellPosition,
});

/**
 * 特技カードの使用によって発生したソース
 */
export type DamageSourceSpell = z.infer<typeof zDamageSourceSpell>;
export const zDamageSourceSpell = z.object({
  type: z.literal(DamageSourceType.SPELL),
  /** 特技カードを使用したリーダー位置 */
  position: zLeaderPosition,
  /** 特技カード実体のID */
  cardId: zId,
});

/**
 * テンションスキルの使用によって発生したソース
 */
export type DamageSourceTentionSkill = z.infer<typeof zDamageSourceTentionSkill>;
export const zDamageSourceTentionSkill = z.object({
  type: z.literal(DamageSourceType.TENTION_SKILL),
  /** テンションスキルを使用したリーダー位置 */
  position: zLeaderPosition,
});

/**
 * ヒーロースキルの使用によって発生したソース
 */
export type DamageSourceHeroSkill = z.infer<typeof zDamageSourceHeroSkill>;
export const zDamageSourceHeroSkill = z.object({
  type: z.literal(DamageSourceType.HERO_SKILL),
  /** ヒーロースキルを使用したリーダー位置 */
  position: zLeaderPosition,
});

/**
 * 攻撃・回復ソースユニオン
 */
export type DamageSource = z.infer<typeof zDamageSource>;
export const zDamageSource = z.discriminatedUnion('type', [
  zDamageSourceLeader,
  zDamageSourceUnit,
  zDamageSourceSpell,
  zDamageSourceTentionSkill,
  zDamageSourceHeroSkill,
]);
