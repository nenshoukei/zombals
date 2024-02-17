import { CardJob, CardPack, CardRarity, CardType, Id, LocaleString, UnitKind } from '../common';
import { GameContext } from '../context';
import { AttackTarget, EffectEndTiming, EffectSource, EffectTarget, EffectTargetType, LeaderPosition, Target, TargetType } from '../field';
import {
  BadgeState,
  BuildingCardState,
  CardState,
  EffectState,
  FieldBuildingState,
  FieldUnitState,
  FloorState,
  HeroCardState,
  HeroSkillCardState,
  SpellCardState,
  Storage,
  TentionSkillCardState,
  UnitCardState,
  WeaponCardState,
} from '../game_state';

/**
 * 定義情報の共通部分
 */
export interface Definition {
  /** 定義ID */
  readonly id: Id;
}

/**
 * 定義クラスの共通 static 部分
 */
export interface DefinitionClass<T extends Definition> {
  /** 定義ID */
  readonly id: Id;
  /** コンストラクタ */
  new (): T;
}

/**
 * カード定義情報の共通部分
 */
export interface CardDefinitionBase<TState extends CardState = CardState> extends Definition {
  /** カード名 */
  name: LocaleString;
  /** カード説明 (リッチテキスト) */
  description: LocaleString;
  /** MPコスト */
  cost: number;
  /** 職業 */
  job: CardJob;
  /** レアリティ */
  rarity: CardRarity;
  /** 収録パック */
  pack: CardPack;
  /** カードを使用する際の選択対象 (対象を取らない場合は空配列とする) */
  targetTypes: TargetType[];
  /** カードを使用する際の追加の選択対象 (主にユニット召喚時効果) */
  additionalTargetTypes?: TargetType[];
  /** トークンかどうか */
  isToken?: boolean;

  /**
   * カードの実体を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @returns 作成された CardState
   */
  createState(ctx: GameContext, owner: LeaderPosition): CardState;

  /**
   * 現在のカード説明文を生成して返す
   *
   * @param ctx コンテキスト
   * @param card カード実体
   * @returns 現在のカード説明文
   */
  getCurrentDescription(ctx: GameContext, card: TState): LocaleString;

  /**
   * カードが手札から現在使用可能かどうかを判定して返す
   *
   * @param ctx コンテキスト
   * @param card カード実体
   * @returns 使用できる場合は `true`, できない場合は `false`
   */
  isUsable(ctx: GameContext, card: TState): boolean;

  /**
   * カードが使用できる対象かどうかを判定して返す
   *
   * @param ctx コンテキスト
   * @param card カード実体
   * @param target 使用対象
   * @returns 使用できる場合は `true`, できない場合は `false`
   */
  isUsableAt(ctx: GameContext, card: TState, target: Target): boolean;

  /**
   * カードの使用時効果が使用できる対象かどうかを判定して返す
   *
   * @param ctx コンテキスト
   * @param card カード実体
   * @param target 使用対象
   * @returns 使用できる場合は `true`, できない場合は `false`
   */
  isAdditionalUsableAt(ctx: GameContext, card: TState, target: Target): boolean;

  /**
   * カード効果を実行する
   *
   * isUsable, isUsableAt のチェックは通ってきている事を前提とする。
   * MP コストの処理、手札から取り除く処理は別で行われる。
   *
   * @param ctx コンテキスト
   * @param card カード実体
   * @param target 使用対象
   * @param additionalTarget 追加の使用対象
   */
  use(ctx: GameContext, card: TState, target?: Target, additionalTarget?: Target): void;

  /**
   * カード効果がプレイヤーによって選択された時に呼び出されるハンドラ
   *
   * GameContext.selectOption() で選択肢が提示され、その中からプレイヤーが選んだ時に呼び出される。
   *
   * @param ctx コンテキスト
   * @param card カード効果の元となったカード実体
   * @param selectedIndex 選択された選択肢インデックス
   */
  onOptionSelected(ctx: GameContext, card: TState, selectIndex: number): void;

  /**
   * 手札がプレイヤーによって選択された時に呼び出されるハンドラ
   *
   * GameContext.selectHand() で手札選択され、その中からプレイヤーが選んだ時に呼び出される。
   *
   * @param ctx コンテキスト
   * @param card カード効果の元となったカード実体
   * @param selectedIndexes 選択された手札インデックス (複数可)
   */
  onHandSelected(ctx: GameContext, card: TState, selectIndexes: number[]): void;
}

/**
 * ユニットカードの定義情報
 */
export interface UnitCardDefinition extends CardDefinitionBase<UnitCardState> {
  type: CardType.UNIT;
  /** 攻撃力 */
  power: number;
  /** 最大HP */
  maxHP: number;
  /** 系統 */
  kind: UnitKind;

  /**
   * UnitCardState を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @returns 作成された UnitCardState
   */
  createState(ctx: GameContext, owner: LeaderPosition): UnitCardState;

  /**
   * フィールドユニットとして召喚された時のイベントハンドラ
   */
  onFieldUnitCreated(ctx: GameContext, unit: FieldUnitState): void;

  /**
   * フィールドユニットが死亡した時のイベントハンドラ
   */
  onFieldUnitDestoyed(ctx: GameContext, unit: FieldUnitState): void;

  /**
   * フィールドユニットが追放された時のイベントハンドラ
   */
  onFieldUnitExiled(ctx: GameContext, unit: FieldUnitState): void;

  /**
   * フィールドユニットが攻撃する直前のイベントハンドラ
   */
  onFieldUnitAttacking(ctx: GameContext, unit: FieldUnitState, target: AttackTarget): void;

  /**
   * フィールドユニットが攻撃した時のイベントハンドラ
   */
  onFieldUnitAttacked(ctx: GameContext, unit: FieldUnitState, target: AttackTarget): void;

  /**
   * フィールドユニットが移動した時のイベントハンドラ
   */
  onFieldUnitMoved(ctx: GameContext, unit: FieldUnitState): void;
}

/**
 * 特技カードの定義情報
 */
export interface SpellCardDefinition extends CardDefinitionBase<SpellCardState> {
  type: CardType.SPELL;

  /**
   * SpellCardState を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @returns 作成された SpellCardState
   */
  createState(ctx: GameContext, owner: LeaderPosition): SpellCardState;
}

/**
 * 武器カードの定義情報
 */
export interface WeaponCardDefinition extends CardDefinitionBase<WeaponCardState> {
  type: CardType.WEAPON;
  /** 攻撃力 */
  power: number;
  /** 耐久力 */
  durability: number;

  /**
   * WeaponCardState を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @returns 作成された WeaponCardState
   */
  createState(ctx: GameContext, owner: LeaderPosition): WeaponCardState;
}

/**
 * 英雄カードの定義情報
 */
export interface HeroCardDefinition extends CardDefinitionBase<HeroCardState> {
  type: CardType.HERO;
  /** 反英雄かどうか */
  isAntiHero?: boolean;

  /**
   * HeroCardState を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @returns 作成された HeroCardState
   */
  createState(ctx: GameContext, owner: LeaderPosition): HeroCardState;
}

/**
 * 建物カードの定義情報
 */
export interface BuildingCardDefinition extends CardDefinitionBase<BuildingCardState> {
  type: CardType.BUILDING;
  /** 耐久力 */
  durability: number;
  /** ダンジョンかどうか */
  isDungeon?: boolean;

  /**
   * BuildingCardState を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @returns 作成された BuildingCardState
   */
  createState(ctx: GameContext, owner: LeaderPosition): BuildingCardState;

  /**
   * フィールド建物が作成された時に呼び出されるイベントハンドラ
   *
   * @param ctx コンテキスト
   * @param floor フィールド建物の実体
   */
  onCreate(ctx: GameContext, building: FieldBuildingState): void;

  /**
   * フィールド建物が破壊された時に呼び出されるイベントハンドラ
   *
   * @param ctx コンテキスト
   * @param floor フィールド建物の実体
   */
  onDestroy(ctx: GameContext, building: FieldBuildingState): void;
}

/**
 * テンションスキルカードの定義
 */
export interface TentionSkillCardDefinition extends CardDefinitionBase<TentionSkillCardState> {
  type: CardType.TENTION_SKILL;

  /**
   * TentionSkillCardState を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @returns 作成された TentionSkillCardState
   */
  createState(ctx: GameContext, owner: LeaderPosition): TentionSkillCardState;
}

/**
 * ヒーロースキルカードの定義
 */
export interface HeroSkillCardDefinition extends CardDefinitionBase<HeroSkillCardState> {
  type: CardType.HERO_SKILL;

  /**
   * HeroSkillCardState を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @returns 作成された HeroSkillCardState
   */
  createState(ctx: GameContext, owner: LeaderPosition): HeroSkillCardState;
}

/**
 * カードの定義情報 (ユニオン)
 */
export type CardDefinition =
  | UnitCardDefinition
  | SpellCardDefinition
  | WeaponCardDefinition
  | HeroCardDefinition
  | BuildingCardDefinition
  | TentionSkillCardDefinition
  | HeroSkillCardDefinition;

/**
 * フィールドの地形 (床) の定義情報
 */
export interface FloorDefinition<TStorage extends Storage | null = Storage | null> extends Definition {
  /** 名前 */
  name: LocaleString;
  /** ストレージの初期状態 */
  initialStorage: TStorage;

  /**
   * FloorState を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @param storage ストレージ状態 (省略時は initialStorage が使われる)
   * @returns 作成された FloorState
   */
  createState(ctx: GameContext, owner: LeaderPosition, storage?: TStorage): FloorState;

  /**
   * 現在の地形の説明文を生成して返す
   *
   * @param ctx コンテキスト
   * @param floor 地形の実体
   * @returns 現在の説明文
   */
  getCurrentDescription(ctx: GameContext, floor: FloorState<TStorage>): LocaleString;

  /**
   * この地形が作成された時に呼び出されるイベントハンドラ
   *
   * - 作成時点でユニットが乗っていた場合、このすぐ後に onUnitStepIn も呼び出される。
   *
   * @param ctx コンテキスト
   * @param floor 地形の実体
   */
  onCreate(ctx: GameContext, floor: FloorState<TStorage>): void;

  /**
   * この地形が破壊された時に呼び出されるイベントハンドラ
   *
   * @param ctx コンテキスト
   * @param floor 地形の実体
   */
  onDestroy(ctx: GameContext, floor: FloorState<TStorage>): void;

  /**
   * この地形にユニットが乗った時に呼び出されるイベントハンドラ
   *
   * @param ctx コンテキスト
   * @param floor 地形の実体
   * @param unit ユニットの実体
   */
  onUnitStepIn(ctx: GameContext, floor: FloorState<TStorage>, unit: FieldUnitState): void;

  /**
   * この地形に乗っていたユニットが移動して外れた時に呼び出されるイベントハンドラ
   *
   * @param ctx コンテキスト
   * @param floor 地形の実体
   * @param unit ユニットの実体
   */
  onUnitStepOut(ctx: GameContext, floor: FloorState<TStorage>, unit: FieldUnitState): void;

  /**
   * この地形に乗っていたユニットが死亡した時に呼び出されるイベントハンドラ
   *
   * @param ctx コンテキスト
   * @param floor 地形の実体
   * @param unit ユニットの実体
   */
  onUnitDeath(ctx: GameContext, floor: FloorState<TStorage>, unit: FieldUnitState): void;
}

/**
 * パワフルバッジをマージする際のパラメータ
 */
export interface MergeBadgeParams<TStorage extends Storage | null = Storage | null> {
  /** コンテキスト */
  ctx: GameContext;
  /** パワフルバッジの対象となるリーダー */
  leader: LeaderPosition;
  /** 既に存在していたパワフルバッジの実体情報 */
  oldBadge: BadgeState<TStorage>;
  /** 新しく付けたパワフルバッジの実体情報 */
  newBadge: BadgeState<TStorage>;
}

/**
 * パワフルバッジの定義情報
 */
export interface BadgeDefinition<TStorage extends Storage | null = Storage | null> extends Definition {
  /** 同じ対象に対して説明文表示時にマージするかどうか */
  isDescriptionMerged: boolean;

  /**
   * BadgeState を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @param storage ストレージ状態
   * @returns 作成された BadgeState
   */
  createState(ctx: GameContext, owner: LeaderPosition, storage: TStorage): BadgeState;

  /**
   * 現在のパワフルバッジ説明文を生成して返す
   *
   * @param ctx コンテキスト
   * @param badge バッジ状態
   * @returns 現在の説明文
   */
  getCurrentDescription(ctx: GameContext, badge: BadgeState<TStorage>): LocaleString | null;

  /**
   * `isDescriptionMerged = true` の時、2つ以上のバッジ実体から同じ対象に対して表示する説明文を生成する。
   *
   * @param ctx コンテキスト
   * @param badges マージ対象の複数のバッジ実体
   * @returns マージした説明文。説明文を表示しない場合は `null` を返す。
   */
  getMergedDescription(ctx: GameContext, badges: BadgeState<TStorage>[]): LocaleString | null;

  /**
   * このパワフルバッジの実体がリーダーに追加された時に呼び出されるイベントハンドラ
   *
   * @param ctx コンテキスト
   * @param badge バッジの実体
   */
  onAdded(ctx: GameContext, badge: BadgeState<TStorage>): void;

  /**
   * このパワフルバッジの実体がリーダーから外された時に呼び出されるイベントハンドラ
   *
   * @param ctx コンテキスト
   * @param badge バッジの実体
   */
  onRemoved(ctx: GameContext, badge: BadgeState<TStorage>): void;
}

/**
 * 持続効果の実体を生成する際のパラメータ
 */
export interface CreateEffectStateParams<TStorage extends Storage | null = Storage | null> {
  /** コンテキスト */
  ctx: GameContext;
  /** 持続効果の所有者 */
  owner: LeaderPosition;
  /** 持続効果の対象 */
  target?: EffectTarget;
  /** 持続効果のソース */
  source: EffectSource;
  /** 持続効果の終了タイミング */
  endTiming?: EffectEndTiming;
  /** 初期ストレージ状態 */
  initialStorage: TStorage;
}

/**
 * 持続効果をマージする際のパラメータ
 */
export interface MergeEffectParams<TStorage extends Storage | null = Storage | null> {
  /** コンテキスト */
  ctx: GameContext;
  /** 持続効果の対象 */
  target?: EffectTarget;
  /** 既に存在していた持続効果の実体情報 */
  oldEffect: EffectState<TStorage>;
  /** 新しく発生した持続効果の実体情報 */
  newEffect: EffectState<TStorage>;
}

/**
 * 持続効果の定義情報
 */
export interface EffectDefinition<TStorage extends Storage | null = Storage | null> extends Definition {
  /** 持続効果の対象 */
  targetTypes: EffectTargetType[];
  /** 同じ対象に対して説明文表示時にマージするかどうか */
  isDescriptionMerged: boolean;

  /**
   * 持続効果の実体 (EffectState) を作成する。
   *
   * @param params パラメータ
   * @returns 作成された持続効果実体
   */
  createState(params: CreateEffectStateParams<TStorage>): EffectState<TStorage>;

  /**
   * 現在の持続効果の説明文を生成して返す
   *
   * @param ctx コンテキスト
   * @param effect 持続効果の実体
   * @returns 現在の説明文。説明文を表示しない場合は `null` を返す。
   */
  getCurrentDescription(ctx: GameContext, effect: EffectState<TStorage>): LocaleString | null;

  /**
   * `isDescriptionMerged = true` の時、2つ以上の持続効果から同じ対象に対して表示する説明文を生成する。
   *
   * @param ctx コンテキスト
   * @param effects マージ対象の複数の持続効果実態
   * @returns マージした説明文。説明文を表示しない場合は `null` を返す。
   */
  getMergedDescription(ctx: GameContext, effects: EffectState<TStorage>[]): LocaleString | null;

  /**
   * 持続効果実体がゲームに追加された時のイベントハンドラ
   */
  onAdded(ctx: GameContext, effect: EffectState<TStorage>): void;

  /**
   * 持続効果実体が取り除かれた時のイベントハンドラ
   */
  onRemoved(ctx: GameContext, effect: EffectState<TStorage>): void;
}
