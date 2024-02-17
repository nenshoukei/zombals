import { HandIndex, Id, SelectOption } from '../common';
import { DefinitionClass, EffectDefinition } from '../definition/base';
import { EffectSource, EffectTarget, LeaderCellPosition, LeaderPosition, Target } from '../field';
import { GameRecord } from '../game_record';
import { CardState, EffectState, GameState, Storage } from '../game_state';
import { GameAction } from '../protocol/game_action';
import { CardContext } from './card_context';
import { FieldContext } from './field_context';
import { PlayerContext } from './player_context';
import { TypedEvent } from '@/utils/typed_event';

/**
 * アクション発生時のイベント
 */
export interface GameActionEvent {
  /** アクション */
  action: GameAction;
  /** アクションのインデックス */
  index: number;
}

/**
 * 現在のゲーム状態の読み取りや操作を行うためのコンテキスト
 *
 * - サーバーサイドでの処理用に使われるので、扱う情報は山札などの非公開情報も含む。
 */
export interface GameContext {
  /**
   * ゲーム情報
   */
  get record(): Readonly<GameRecord>;

  /**
   * 現在のゲーム状態
   */
  get state(): Readonly<GameState>;

  /**
   * ターンを実行中のプレイヤーのコンテキスト
   */
  get ally(): PlayerContext;

  /**
   * ターン実行中ではないプレイヤーのコンテキスト
   */
  get enemy(): PlayerContext;

  /**
   * フィールド
   */
  get field(): FieldContext;

  /**
   * 現在のターン番号
   */
  get turn(): number;

  /**
   * アクション発生イベント
   */
  get onAction(): TypedEvent<GameActionEvent>;

  /**
   * ゲームの状態を更新する
   */
  updateState(newState: GameState): void;

  /**
   * ランダムな整数を生成する
   *
   * - この乱数はカード効果の処理のためだけに使用すること。
   *
   * @param min 最小値 (inclusive)
   * @param max 最大値 (inclusive)
   * @returns 生成された整数
   */
  generateRandomInt(min: number, max: number): number;

  /**
   * State の ID を生成する
   *
   * @returns 生成されたID
   */
  generateStateID(): Id;

  /**
   * アクション結果を記録する
   *
   * @param action アクション結果
   */
  emitAction(action: GameAction): void;

  /**
   * ゲーム開始
   */
  startGame(): void;

  /**
   * プレイヤーがマリガンした
   *
   * @param position プレイヤーの位置
   * @param swapped 交換した手札位置
   */
  playerMulligan(position: LeaderPosition, swapped: HandIndex[]): void;

  /**
   * プレイヤーが投了した
   *
   * @param position プレイヤーの位置
   */
  playerSurrender(position: LeaderPosition): void;

  /**
   * プレイヤーがエモートを送信した
   *
   * @param position プレイヤーの位置
   * @param emoteId エモートID
   */
  playerEmote(position: LeaderPosition, emoteId: Id): void;

  /**
   * プレイヤーが攻撃操作した
   *
   * @param attacker 攻撃開始位置
   * @param target 攻撃対象位置
   */
  playerAttack(attacker: LeaderCellPosition, target: LeaderCellPosition): void;

  /**
   * プレイヤーがテンションアップした
   *
   * @param position プレイヤーの位置
   */
  playerTentionUp(position: LeaderPosition): void;

  /**
   * プレイヤーが手札を使用した
   *
   * @param position プレイヤーの位置
   * @param cardId 使用したカード実体ID
   * @param target 使用対象
   */
  playerUseCard(position: LeaderPosition, cardId: Id, target?: Target): void;

  /**
   * リーダー位置からプレイヤーのコンテキストを取得する
   *
   * @param position リーダー位置
   * @returns プレイヤーのコンテキスト
   */
  getPlayer(position: LeaderPosition): PlayerContext;

  /**
   * カード実体のコンテキストを取得する
   *
   * @param card カード実体
   * @returns カード実体のコンテキスト
   */
  getCardContext<T extends CardState>(card: T): CardContext<T>;

  /**
   * ユニットの状態やリーダーの敗北などをチェックして調整する
   *
   * このチェックを通過したら新しいコマンドが受け付けられるようになる。
   */
  checkConditions(): void;

  /**
   * 現在のターンを終了する
   */
  endCurrentTurn(): void;

  /**
   * アクティブプレイヤーにカード効果を選択させる
   *
   * 占いなどカードプレイ時の選択、または、りゅうおうなど次ターン開始時の選択がある。
   * 選択結果は非同期に card の CardDefinition に対して onOptionSelected が呼び出される。
   *
   * @param card 効果の元となったカード実体
   * @param options 選択肢配列
   */
  selectOption(card: CardState, options: [SelectOption, SelectOption, ...SelectOption[]]): void;

  /**
   * アクティブプレイヤーに占い効果を発動する
   *
   * 必中モードではカード効果の選択、超必中モードでは全ての効果の発動、
   * そうでなければランダムに効果が選ばれる。
   *
   * 選ばれた効果それぞれについて CardDefinition の onOptionSelected が呼び出される。
   *
   * @param card 効果の元となったカード実体
   * @param options 選択肢配列
   */
  fortune(card: CardState, options: [SelectOption, SelectOption, ...SelectOption[]]): void;

  /**
   * アクティブプレイヤーに手札を選択させる
   *
   * 選ばれたら CardDefinition の onHandSelected が呼び出される。
   *
   * @param card 効果の元となったカード実体
   * @param numberOfCards 選ぶ枚数
   * @param selectableHands 選択可能な手札のインデックス配列 (省略時は全手札が選択対象)
   */
  selectHand(card: CardState, numberOfCards: number, selectableHands?: HandIndex[]): void;

  /**
   * 持続効果を追加する。
   *
   * 同じ対象に対する重複不可の持続効果の場合は自動的にマージされる。
   *
   * @param effect 追加する持続効果の実体
   */
  addEffect(effect: EffectState): void;

  /**
   * 持続効果を取り除く。
   *
   * @param effect 取り除く持続効果の実体または実体ID
   */
  removeEffect(effect: EffectState | Id): void;

  /**
   * 指定した効果ソースを持つ持続効果を全て取り除く。
   *
   * @param source 検索に使う効果ソース
   */
  removeAllEffectsBySource(source: EffectSource): void;

  /**
   * 指定した対象に対する持続効果を全て取り除く。
   *
   * @param target 効果対象
   */
  removeAllEffectsByTarget(target: EffectTarget): void;

  /**
   * 指定した定義の持続効果を取得する。
   *
   * 複数ある場合は、一番最初のものを返す。
   *
   * @param effectDef 持続効果定義
   * @param target 効果対象 (省略時は対象関係なく検索)
   * @returns 見つかった持続効果の実体、見つからなかったら `undefined`
   */
  findEffectByDef<T extends Storage | null>(
    effectDef: EffectDefinition<T> | DefinitionClass<EffectDefinition>,
    target?: EffectTarget,
  ): EffectState<T> | undefined;

  /**
   * 指定した定義IDの持続効果をすべて取得する。
   *
   * @param effectDefId 持続効果定義ID
   * @param target 効果対象 (省略時は対象関係なく検索)
   * @returns 見つかった持続効果実体の配列
   */
  findAllEffectsByDef<T extends Storage | null>(
    effectDef: EffectDefinition<T> | DefinitionClass<EffectDefinition>,
    target?: EffectTarget,
  ): EffectState<T>[];

  /**
   * 指定した効果対象についている持続効果をすべて取得する。
   *
   * @param target 効果対象
   * @returns 見つかった持続効果実体の配列
   */
  findAllEffectsByTarget(target: EffectTarget): EffectState[];

  /**
   * 指定した効果対象についている持続効果と効果対象の指定のない持続効果をすべて取得する。
   *
   * @param target 効果対象
   * @returns 見つかった持続効果実体の配列
   */
  findAllEffectsByTargetOrAny(target: EffectTarget): EffectState[];
}
