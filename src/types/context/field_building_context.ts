import { CellPosition, TargetBuilding } from '../field';
import { FieldBuildingState } from '../game_state';
import { FieldObjectContext } from './field_object_context';

/**
 * 現在のフィールド建物状態の読み取りや操作を行うためのコンテキスト
 */
export interface FieldBuildingContext extends FieldObjectContext {
  /**
   * 現在のフィールド建物状態
   */
  get state(): Readonly<FieldBuildingState>;

  /**
   * フィールド建物の位置
   */
  get position(): CellPosition;

  /**
   * ターゲットとする際の TargetBuilding
   */
  get asTarget(): Readonly<TargetBuilding>;

  /**
   * 建物の耐久度
   */
  get durability(): number;

  /**
   * フィールド建物の状態を更新する
   */
  updateState(newState: FieldBuildingState): void;

  /**
   * フィールド建物を破壊する。
   */
  destroy(): void;

  /**
   * スタッツ変更を通知する。
   */
  statsChanged(): void;
}
