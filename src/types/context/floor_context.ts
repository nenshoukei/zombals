import { CellPosition, EffectSource, TargetFloor } from '../field';
import { FloorState } from '../game_state';

/**
 * 現在のフィールド地形状態の読み取りや操作を行うためのコンテキスト
 */
export interface FloorContext {
  /**
   * 現在のフィールド建物状態
   */
  get state(): Readonly<FloorState>;

  /**
   * フィールド建物の位置
   */
  get position(): CellPosition;

  /**
   * ターゲットとする際の TargetBuilding
   */
  get asTarget(): Readonly<TargetFloor>;

  /**
   * 持続効果源となる際の EffectSource
   */
  get asEffectSource(): EffectSource;

  /**
   * フィールド地形の状態を更新する
   */
  updateState(newState: FloorState): void;

  /**
   * フィールド地形を破壊する。
   */
  destroy(): void;
}
