import { AttackTarget, CellPosition, DamageSource, LeaderPosition, TargetLeader, TargetUnit } from '../field';
import { FieldUnitState, PlayerState } from '../game_state';

/**
 * 攻撃したり効果や攻撃の対象になったりできるリーダーまたはフィールドユニットのコンテキスト
 */
export interface AttackableContext {
  /**
   * 現在の状態
   */
  get state(): Readonly<PlayerState | FieldUnitState>;

  /**
   * フィールドでの位置
   */
  get position(): LeaderPosition | CellPosition;

  /**
   * ターゲットとする際の TargetLeader または TargetUnit
   */
  get asTarget(): TargetLeader | TargetUnit;

  /**
   * 攻撃可能かどうかを判定する。
   *
   * @param target 攻撃対象
   * @returns 攻撃可能なら `true`。不可なら `false`。
   */
  canAttack(target: AttackTarget): boolean;

  /**
   * 攻撃する。
   *
   * - 対象に攻撃力分のダメージを与えて、自分も反撃ダメージを受ける。
   *
   * @param target 攻撃対象
   */
  attack(target: AttackTarget): void;

  /**
   * この効果対象にダメージを与える。
   *
   * - ダメージ減効果などの耐性が考慮され、ダメージが減ったり 0 になったりする。
   * - 残り HP が 0 になった場合の処理も自動で行われる。
   *
   * @param damage ダメージ量
   * @param source ダメージ源
   * @returns 実際に与えたダメージ
   */
  gainDamage(damage: number, source: DamageSource): number;

  /**
   * この効果対象の HP を回復する。
   *
   * - 最大 HP 以上には回復しない。
   * - HP 回復反転状態が考慮され、逆にダメージを与えるケースがある。
   *
   * @param heal 回復量
   * @param source 回復源
   * @returns 実際に回復した回復量（ダメージを与えた場合はマイナス値）
   */
  gainHeal(heal: number, source: DamageSource): number;
}
