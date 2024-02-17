import { CardState } from '../game_state';

/**
 * カード実体の読み取りや操作を行うコンテキスト
 */
export interface CardContext<T extends CardState> {
  /**
   * 現在のカード実体状態
   */
  get state(): Readonly<T>;

  /**
   * カードの状態を更新する
   */
  updateState(newState: T): void;

  /**
   * カードのコストを増減させる
   *
   * - コストを減らしてマイナスになる場合は 0 に補正される。
   *
   * @param delta 変化量 (マイナスだと減る)
   */
  changeCost(delta: number): void;
}
