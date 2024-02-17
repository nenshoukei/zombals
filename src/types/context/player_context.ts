import { HandIndex, Id } from '../common';
import { WeaponCardDefinition } from '../definition/base';
import { DamageSourceLeader, EffectSource, LeaderPosition, SidePositionList, Target, TargetLeader } from '../field';
import { BadgeState, CardState, HeroSkillCardState, PlayerState, TentionSkillCardState, WeaponCardState } from '../game_state';
import { AttackableContext } from './attackable_context';
import { CardContext } from './card_context';
import { EquippedWeaponContext } from './equipped_weapon_context';

/**
 * 現在のプレイヤー状態の読み取りや操作を行うためのコンテキスト
 */
export interface PlayerContext extends AttackableContext {
  /**
   * 現在のプレイヤー状態
   */
  get state(): Readonly<PlayerState>;

  /**
   * リーダー位置
   */
  get position(): LeaderPosition;

  /**
   * 位置リスト
   */
  get positions(): Readonly<SidePositionList>;

  /**
   * ターゲットとする際の TargetLeader
   */
  get asTarget(): TargetLeader;

  /**
   * ダメージ源となる際の DamageSource
   */
  get asDamageSource(): DamageSourceLeader;

  /**
   * 持続効果源となる際の EffectSource
   */
  get asEffectSource(): EffectSource;

  /**
   * 最大 HP
   */
  get maxHP(): number;

  /**
   * 残り HP
   */
  get currentHP(): number;

  /**
   * 最大 MP
   */
  get maxMP(): number;

  /**
   * 残り MP
   */
  get currentMP(): number;

  /**
   * テンション数
   */
  get tentionCount(): number;

  /**
   * テンションスキルのコンテキスト
   */
  get tentionSkill(): CardContext<TentionSkillCardState> | null;

  /**
   * ヒーロースキルのコンテキスト
   */
  get heroSkill(): CardContext<HeroSkillCardState> | null;

  /**
   * 装備中の武器のコンテキスト
   */
  get weapon(): EquippedWeaponContext | null;

  /**
   * プレイヤーの状態を更新する
   */
  updateState(newState: PlayerState): void;

  /**
   * @returns Effect と装備武器を適用して計算された攻撃力
   */
  getCalculatedPower(): number;

  /**
   * マリガンする。
   *
   * @param swapped 交換した手札インデックス
   */
  mulligan(swapped: HandIndex[]): void;

  /**
   * 山札からカードを引く。
   *
   * - 山札にカードがない場合、ファティーグダメージを受ける。
   * - 手札が一杯の場合、引いたカードはゲームから追放される。
   *
   * @param numberOfCards 引く枚数
   */
  drawCard(numberOfCards: number): void;

  /**
   * 手札にカード実体を加える。
   *
   * - カード実体を直接手札に加える。
   * - 例えば山札にあるカード実体を手札に加える場合、
   *   元あった山札の対象カード実体は自動で削除される。
   * - 既に手札にあるカード実体を加えようとした場合は何もしない。
   * - 相手のカード実体を直接自分の手札に加える事はできない。
   *   （盗むなどの効果はコピーしてから手札に加える addCopyCardToHand を使うこと）
   * - 手札が一杯の場合、加えようとしたカード実体はゲームから取り除かれる。
   *
   * @param cards 手札に加えるカード実体の配列
   */
  addCardsToHand(cards: CardState[]): void;

  /**
   * 手札にカード実体のコピートークンを加える。
   *
   * - カード実体をコピーしてトークンのカード実体を生成して手札に加える。
   * - addCardsToHand とは異なり、元あったカード実体は削除されない。
   * - 既に手札にあるカード実体を対象とした場合も、コピーが生成される。
   * - 相手のカード実体をコピーする事もできる。（盗む）
   * - 手札が一杯の場合、加えようとしたコピートークンはゲームから取り除かれる。
   *
   * @param cards 手札に加えるコピーの元となるカード実体の配列
   */
  addCopyCardsToHand(cards: CardState[]): void;

  /**
   * 手札のカードを使用する。(テンションスキル / ヒーロースキルも兼用)
   *
   * 以下を実行する:
   * - コスト分の MP を減らす。(MP が不足している場合は 0 になる)
   * - 対象カードを手札から取り除く。(テンションスキルやヒーロースキルの場合は何もしない)
   * - 使用済みカードとして記録する。
   * - カード効果を実行する。(Definition.use() の呼び出し)
   *   前提として isUsable, isUsableAt のチェックは通ってきているものとする。
   *
   * カード効果の処理については Definition 側の処理になる。
   *
   * @param card 取り除くカード実体ID または カード実体
   * @param target 使用対象
   * @returns 消費されたカード実体
   */
  useCard(card: Id | CardState, target?: Target): CardState;

  /**
   * テンションを上昇させる。
   *
   * @param tentionUpCount 上昇させるテンション数 (0 以下の場合は何もしない)
   */
  gainTention(tentionUpCount: number): void;

  /**
   * テンション数を設定する。
   *
   * @param newTentionCount 設定するテンション数
   */
  setTentionCount(newTentionCount: number): void;

  /**
   * 武器カード実体を元に装備する。
   *
   * すでに武器を装備している場合、元の武器は破棄される。
   *
   * @param weapon 装備する武器カード実体
   * @returns 作成された装備武器のコンテキスト
   */
  equipWeaponCard(weapon: WeaponCardState): EquippedWeaponContext;

  /**
   * 武器カード定義を元に装備する。
   *
   * すでに武器を装備している場合、元の武器は破棄される。
   *
   * @param weaponDef 装備する武器カード定義
   * @returns 作成された装備武器のコンテキスト
   */
  equipWeaponDef(weaponDef: WeaponCardDefinition): EquippedWeaponContext;

  /**
   * 装備している武器を破壊する。
   */
  breakWeapon(): void;

  /**
   * 死亡したユニット定義IDを追加する。
   *
   * @param unitDefId 死亡したユニットの定義ID
   */
  addDeadUnitDefId(unitDefId: Id): void;

  /**
   * テンションスキルを変更する。
   *
   * @param newTentionSkill 新しいテンションスキル
   */
  setTentionSkill(newTentionSkill: TentionSkillCardState): void;

  /**
   * ヒーロースキルを変更する。
   *
   * @param newHeroSkill 新しいヒーロースキル
   */
  setHeroSkill(newHeroSkill: HeroSkillCardState): void;

  /**
   * パワフルバッジを追加する。
   *
   * @param badge パワフルバッジ
   */
  addBadge(badge: BadgeState): void;

  /**
   * パワフルバッジを削除する。
   *
   * @param badge 削除するパワフルバッジ
   */
  removeBadge(badge: BadgeState): void;

  /**
   * ランダムなパワフルバッジを削除する。
   *
   * @param numberOfBadges 削除する数
   */
  removeRandomBadges(numberOfBadges: number): void;

  /**
   * スタッツ変更を通知する。
   */
  statsChanged(): void;
}
