import { CellPosition, ColumnPosition, EffectSource, RowPosition, SideRowPosition, TargetBuilding, TargetUnit } from '../field';
import { FieldObjectState } from '../game_state';

/**
 * 現在のフィールドオブジェクト（ユニットまたは建物）の読み取りや操作を行うコンテキスト
 */
export interface FieldObjectContext {
  /**
   * 現在のフィールドオブジェクト状態
   */
  get state(): Readonly<FieldObjectState>;

  /**
   * フィールドオブジェクトの位置
   */
  get position(): CellPosition;

  /**
   * ターゲットとする際の TargetUnit または TargetBuilding
   */
  get asTarget(): Readonly<TargetUnit | TargetBuilding>;

  /**
   * 持続効果源となる際の EffectSource
   */
  get asEffectSource(): EffectSource;

  /**
   * フィールドオブジェクトの横行位置
   */
  get row(): RowPosition;

  /**
   * フィールドオブジェクトの縦列位置
   */
  get column(): ColumnPosition;

  /**
   * フィールドオブジェクトを含む片側横行位置
   */
  get sideRow(): SideRowPosition;
}
