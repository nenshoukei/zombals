import { EffectDefinition } from '../definition/base';
import { CellPosition, DamageSourceUnit, EffectEndTiming, EffectSource, TargetUnit } from '../field';
import { FieldUnitState } from '../game_state';
import { AttackableContext } from './attackable_context';
import { FieldObjectContext } from './field_object_context';

/**
 * 現在のフィールドユニット状態の読み取りや操作を行うためのコンテキスト
 */
export interface FieldUnitContext extends FieldObjectContext, AttackableContext {
  /**
   * 現在のフィールドユニット状態
   */
  get state(): Readonly<FieldUnitState>;

  /**
   * フィールドユニットの位置
   */
  get position(): CellPosition;

  /**
   * ターゲットとする際の TargetUnit
   */
  get asTarget(): Readonly<TargetUnit>;

  /**
   * ダメージ源となる際の DamageSource
   */
  get asDamageSource(): DamageSourceUnit;

  /**
   * 現在の HP
   */
  get currentHP(): number;

  /**
   * 現在の HP を設定
   */
  set currentHP(newHP: number);

  /**
   * フィールドユニットの状態を更新する
   */
  updateState(newState: FieldUnitState): void;

  /**
   * @returns Effect を適用して計算された攻撃力
   */
  getCalculatedPower(): number;

  /**
   * @returns Effect を適用して計算された最大 HP
   */
  getCalculatedMaxHP(): number;

  /**
   * ステルス中かどうかを返す
   */
  isStealth(): boolean;

  /**
   * 「闇の衣」中かどうかを返す
   */
  isDarkClothed(): boolean;

  /**
   * 移動可能かどうかを返す
   */
  isMovable(): boolean;

  /**
   * ユニットに持続効果を定義から作成して追加する。
   *
   * - 持続効果はユニットが自分自身に掛けるものとして扱われる。
   * - 持続効果の終了条件は指定不可。（永続）
   *
   * @param effectDef 持続効果の定義
   * @param initialStorage 初期ストレージ
   */
  addEffectDef<TStorage extends Storage | null, TDef extends EffectDefinition<TStorage>>(effectDef: TDef, initialStorage: TStorage): void;

  /**
   * スタッツを増減させる。
   *
   * - 内部的には StatsChangeEffect が作成される。
   * - 最大HPを減らした結果 0 以下になった場合はユニットは死亡する。
   * - 最大HPを増やす場合はその分現在HPを回復する。
   *
   * @param powerDelta 攻撃力の変化量 (マイナスを指定すると減る)
   * @param maxHPDelta 最大HPの変化量 (マイナスを指定すると減る)
   * @param source 持続効果のソース
   * @param endTiming 効果が終了するタイミング (未指定だと永続)
   */
  changeStats(powerDelta: number, maxHPDelta: number, source: EffectSource, endTiming?: EffectEndTiming): void;

  /**
   * スタッツを上書き設定する。
   *
   * - 内部的には StatsSetEffect が作成される。
   * - 最大HPを 0 にした場合はユニットは死亡する。
   *
   * @param power 新しい攻撃力の値 (null にすると上書きしない)
   * @param maxHP 新しい最大HPの値 (null にすると上書きしない)
   * @param source 持続効果のソース
   * @param endTiming 効果が終了するタイミング (未指定だと永続)
   */
  setStats(power: number | null, maxHP: number | null, source: EffectSource, endTiming?: EffectEndTiming): void;

  /**
   * ユニットを死亡させる。
   */
  destroy(): void;

  /**
   * ユニットを追放する。
   */
  exile(): void;

  /**
   * スタッツ変更を通知する。
   */
  statsChanged(): void;
}
