import { EquippedWeaponState } from '../game_state';

/**
 * 装備中武器の読み取りや操作を行うコンテキスト
 */
export interface EquippedWeaponContext {
  /**
   * 現在の装備中武器の状態
   */
  get state(): Readonly<EquippedWeaponState>;

  /**
   * 装備中武器の状態を更新する
   */
  updateState(newState: EquippedWeaponState): void;

  /**
   * @returns Effect を適用して計算された攻撃力
   */
  getCalculatedPower(): number;
}
