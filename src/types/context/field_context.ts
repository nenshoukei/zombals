import { Id } from '../common';
import { BuildingCardDefinition, FloorDefinition, UnitCardDefinition } from '../definition/base';
import { CellPosition, LeaderCellPosition, LeaderPosition, SideRowPosition, TargetLeader, TargetUnit } from '../field';
import {
  BuildingCardState,
  FieldBuildingState,
  FieldObjectState,
  FieldState,
  FieldUnitState,
  FloorState,
  UnitCardState,
} from '../game_state';
import { AttackableContext } from './attackable_context';
import { FieldBuildingContext } from './field_building_context';
import { FieldObjectContext } from './field_object_context';
import { FieldUnitContext } from './field_unit_context';
import { FloorContext } from './floor_context';

/**
 * 現在のフィールド状態の読み取りや操作を行うためのコンテキスト
 */
export interface FieldContext {
  /**
   * 現在のフィールド状態
   */
  get state(): Readonly<FieldState>;

  /**
   * フィールドの状態を更新する
   */
  updateState(newState: FieldState): void;

  /**
   * フィールドユニット実体のコンテキストを取得する
   *
   * @param unit フィールドユニット実体
   * @returns フィールドユニット実体のコンテキスト
   */
  getFieldUnitContext(unit: FieldUnitState): FieldUnitContext;

  /**
   * フィールド建物実体のコンテキストを取得する
   *
   * @param building フィールド建物実体
   * @returns フィールド建物実体のコンテキスト
   */
  getFieldBuildingContext(building: FieldBuildingState): FieldBuildingContext;

  /**
   * フィールドユニット・フィールド建物の状態を更新する
   *
   * フィールドに出ている同じ ID のユニット/建物状態を差し替える。
   */
  updateFieldObjectState(newState: FieldObjectState): void;

  /**
   * フィールド地形の状態を更新する
   *
   * フィールドに出ている同じ ID の地形を差し替える。
   */
  updateFloorState(newState: FloorState): void;

  /**
   * 敵・味方問わずフィールド上の攻撃・特技対象（リーダー・ユニット）のコンテキストを取得する。
   *
   * @returns すべての効果対象のコンテキストの配列
   */
  getAllAttackTargets(): AttackableContext[];

  /**
   * 対象リーダー側のフィールド上の攻撃・特技対象（リーダー・ユニット）のコンテキストを取得する
   *
   * @param leader 対象リーダー
   * @returns 効果対象コンテキストの配列
   */
  getAllAttackTargetsOfLeader(leader: LeaderPosition): AttackableContext[];

  /**
   * 指定マスにいるリーダーまたはユニットの AttackableContext を取得する。
   *
   * @param cell 指定マス
   * @returns 存在していれば AttackableContext。いなければ `null`。
   */
  getAttackTargetAt(cell: LeaderCellPosition): AttackableContext | null;

  /**
   * 効果対象情報から AttackableContext を取得する。
   *
   * @param target 効果対象情報
   * @returns 存在していれば AttackableContext。いなければ `null`。
   */
  getAttackTargetByTarget(target: TargetLeader | TargetUnit): AttackableContext | null;

  /**
   * 敵・味方問わず全てのフィールドユニットのコンテキストを取得する。
   *
   * @returns すべてのフィールドユニットのコンテキストの配列
   */
  getAllUnits(): FieldUnitContext[];

  /**
   * 対象リーダー側の全てのフィールドユニットのコンテキストを取得する。
   *
   * @param leader 対象リーダー
   * @returns フィールドユニットコンテキストの配列
   */
  getAllUnitsOfLeader(leader: LeaderPosition): FieldUnitContext[];

  /**
   * 指定マスにいるフィールドユニットのコンテキストを取得する。
   *
   * @param cell 指定マス
   * @returns 存在していればフィールドユニットのコンテキスト。いなければ `null`。
   */
  getUnitAt(cell: CellPosition): FieldUnitContext | null;

  /**
   * 指定したIDを持つフィールドユニットのコンテキストを取得する。
   *
   * @param unitId FieldUnitState.id
   * @returns 存在していればフィールドユニットのコンテキスト。いなければ `null`。
   */
  getUnitById(unitId: Id): FieldUnitContext | null;

  /**
   * 指定したIDを持つフィールドユニットの位置を取得する。
   *
   * @param unitId FieldUnitState.id
   * @returns 存在していればフィールドユニットの位置。いなければ `null`。
   */
  getUnitPositionById(unitId: Id): CellPosition | null;

  /**
   * ユニットカード定義を元にしたフィールドユニットを指定リーダーの空きマスに置く。
   *
   * @param unitDef ユニットカード定義
   * @param leader 配置先のリーダー
   * @returns 作成されたフィールドユニットのコンテキスト。
   *    空いているマスがない場合は `null` を返す。
   */
  putUnitDefForLeader(unitDef: UnitCardDefinition, leader: LeaderPosition): FieldUnitContext | null;

  /**
   * ユニットカード実体を元にしたフィールドユニットを空きマスに置く。
   *
   * - 配置先はカードオーナーの空いているマスを自動で選ぶ
   *
   * @param unit ユニットカード実体
   * @returns 作成されたフィールドユニットのコンテキスト。
   *    空いているマスがない場合は `null` を返す。
   */
  putUnitCard(unit: UnitCardState): FieldUnitContext | null;

  /**
   * 指定マスにユニットカード定義を元にしたフィールドユニットを置く。
   *
   * @param unitDef ユニットカード定義
   * @param cell 指定マス
   * @returns 作成されたフィールドユニットのコンテキスト
   */
  putUnitDefAt(unitDef: UnitCardDefinition, cell: CellPosition): FieldUnitContext;

  /**
   * 指定マスにユニットカード実体を元にしたフィールドユニットを置く。
   *
   * @param unit ユニットカード実体
   * @param cell 指定マス
   * @returns 作成されたフィールドユニットのコンテキスト
   */
  putUnitCardAt(unit: UnitCardState, cell: CellPosition): FieldUnitContext;

  /**
   * 指定マスにあるフィールド建物のコンテキストを取得する。
   *
   * @param cell 指定マス
   * @returns 存在していればフィールド建物のコンテキスト。なければ `null`。
   */
  getBuildingAt(cell: CellPosition): FieldBuildingContext | null;

  /**
   * 指定したIDを持つフィールド建物のコンテキストを取得する。
   *
   * @param buildingId FieldBuildingState.id
   * @returns 存在していればフィールド建物のコンテキスト。なければ `null`。
   */
  getBuildingById(buildingId: Id): FieldBuildingContext | null;

  /**
   * 指定したIDを持つフィールド建物の位置を取得する。
   *
   * @param buildingId FieldBuildingState.id
   * @returns 存在していればフィールド建物の位置。なければ `null`。
   */
  getBuildingPositionById(buildingId: Id): CellPosition | null;

  /**
   * 指定マスに建物カード定義を元にしたフィールド建物を置く。
   *
   * @param buildingDef 建物カード定義
   * @param cell 指定マス
   * @returns 作成されたフィールド建物のコンテキスト
   */
  putBuildingDefAt(buildingDef: BuildingCardDefinition, cell: CellPosition): FieldBuildingContext;

  /**
   * 指定マスに建物カード実体を元にしたフィールド建物を置く。
   *
   * @param building 建物カード実体
   * @param cell 指定マス
   * @returns 作成されたフィールド建物のコンテキスト
   */
  putBuildingCardAt(building: BuildingCardState, cell: CellPosition): FieldBuildingContext;

  /**
   * フィールドからフィールドオブジェクト実体を取り除く。
   *
   * ユニットの死亡時イベントなどを発生させる。
   *
   * @param unit 取り除くフィールドオブジェクトの実体
   * @param reason 取り除かれた理由 (DESTROYED = 死亡/破壊, EXILED = 追放)
   */
  removeObject(object: FieldObjectState, reason: 'DESTROYED' | 'EXILED'): void;

  /**
   * 指定マスに地形定義を元にしたフィールド地形を置く。
   *
   * @param floorDef 地形定義
   * @param cell 指定マス
   * @returns 作成されたフィールド地形のコンテキスト
   */
  putFloorDefAt(floorDef: FloorDefinition, cell: CellPosition): FloorContext;

  /**
   * 指定マスにフィールド地形を置く。
   *
   * @param floor フィールド地形実体
   * @param cell 指定マス
   * @returns 作成されたフィールド地形のコンテキスト
   */
  putFloorAt(floor: FloorState, cell: CellPosition): FloorContext;

  /**
   * 対象ユニットを指定マスに移動させる。
   *
   * - 対象ユニットが移動不可の場合は何もしない。
   * - 移動先に既にオブジェクトが存在する場合は何もしない。（入れ替えたい場合は swap）
   * - 敵・味方の境界をまたいでの移動は不可。
   *
   * @param from 対象ユニットが存在するマス
   * @param to 移動先のマス
   */
  moveUnitPositionTo(from: CellPosition, to: CellPosition): void;

  /**
   * 指定マス2つにいるユニットの位置を入れ替える。
   *
   * - いずれかのユニットが移動不可の場合は何もしない。
   * - 片方のマスにしかユニットがいない場合は、そのユニットが移動するだけ。
   * - 移動先に建物がある場合は何もしない。
   * - 敵・味方の境界をまたいでの移動は不可。
   *
   * @param cell1 入れ替え対象のセル1
   * @param cell2 入れ替え対象のセル2
   */
  swapUnitPositions(cell1: CellPosition, cell2: CellPosition): void;

  /**
   * 片側横行の2マスを対象にしてユニットの前後を入れ替える。
   *
   * 詳しくは swapUnitPositions を参照。
   *
   * @param sideRow 対象となる片側横行
   */
  swapUnitPositionsOnSideRow(sideRow: SideRowPosition): void;

  /**
   * 対象マスにいるユニットのコントローラ（所有者）を変える。
   *
   * - 移動先は移動先プレイヤーの空きマスが自動で選ばれる。
   * - 空きマスがない場合は失敗として何もしない。
   *
   * @param target 対象となるユニット位置
   */
  changeControllerOfUnit(target: CellPosition): void;

  /**
   * 指定マスにあるフィールドオブジェクト（ユニット / 建物）の状態を取得する。
   *
   * @param cell 指定マス
   * @returns 存在していればフィールドオブジェクトのコンテキスト。なければ `null`。
   */
  getObjectAt(cell: CellPosition): FieldObjectContext | null;

  /**
   * 指定フィールドオブジェクトが存在するマスの位置を取得する。
   *
   * @param object 検索するフィールドオブジェクト
   * @returns 見つかったらセルの位置。見つからなければ `null`
   */
  getPositionOfObject(object: FieldObjectState): CellPosition | null;

  /**
   * 指定リーダーのフィールドがオブジェクトで埋め尽くされているかどうか。
   *
   * @param leader 指定リーダー
   * @returns オブジェクトで埋め尽くされていれば `true`、空きがあれば `false`。
   */
  isFullObjectForLeader(leader: LeaderPosition): boolean;

  /**
   * 指定マスにある地形の状態を取得する。
   *
   * @param cell 指定マス
   * @returns 存在していればフィールド地形のコンテキスト。なければ `null`。
   */
  getFloorAt(cell: CellPosition): FloorContext | null;

  /**
   * 指定したIDを持つフィールド地形のコンテキストを取得する。
   *
   * @param floorId FloorState.id
   * @returns 存在していればフィールド地形のコンテキスト。なければ `null`。
   */
  getFloorById(floorId: Id): FloorContext | null;

  /**
   * 指定したIDを持つフィールド地形の位置を取得する。
   *
   * @param floorId FloorState.id
   * @returns 存在していればフィールド地形の位置。なければ `null`。
   */
  getFloorPositionById(floorId: Id): CellPosition | null;

  /**
   * 指定フィールド地形が存在するマスの位置を取得する。
   *
   * @param object 検索するフィールド地形
   * @returns 見つかったらセルの位置。見つからなければ `null`
   */
  getPositionOfFloor(floor: FloorState): CellPosition | null;

  /**
   * フィールドからフィールド地形を取り除く。
   *
   * @param floor 取り除くフィールド地形の実体
   */
  removeFloor(floor: FloorState): void;

  /**
   * 指定マスが指定リーダーのものかどうか判定する。
   *
   * @param cell 指定マス
   * @param leader 指定リーダー
   * @returns 指定リーダーのものであれば `true`, そうでなければ `false`
   */
  isCellOwnedBy(cell: CellPosition, leader: LeaderPosition): boolean;
}
