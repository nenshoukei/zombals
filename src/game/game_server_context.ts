import prand, { RandomGenerator } from 'pure-rand';
import { GameCardContext } from './game_card_context';
import { GameFieldContext } from './game_field_context';
import { GamePlayerContext } from './game_player_context';
import { FIRST_HAND_NUM, MAX_TENTION, MULLIGAN_TIMEOUT_MS, PLAYER_MAX_HP, TURN_TIMEOUT_MS } from '@/config/common';
import { getTentionSkillDefByJob } from '@/config/tention_skill';
import { FortuneTrueEffect } from '@/definition/effect/020_fortune_true_effect';
import { FortuneSuperTrueEffect } from '@/definition/effect/021_fortune_super_true_effect';
import { cardRegistry, effectRegistry } from '@/registry';
import {
  AttackTarget,
  BY_LEADER,
  CardContext,
  CardState,
  CardType,
  CellPosition,
  DefinitionClass,
  EffectDefinition,
  EffectSource,
  EffectState,
  EffectTarget,
  FieldContext,
  FieldState,
  GameAction,
  GameActionEvent,
  GameActionType,
  GameContext,
  GameForbiddenOperationError,
  GamePlayer,
  GameRecord,
  GameRuntimeError,
  GameState,
  getCurrentTime,
  HandIndex,
  Id,
  isSameTarget,
  LeaderCellPosition,
  LeaderPosition,
  LEADERS,
  PlayerContext,
  PlayerState,
  SelectOption,
  Storage,
  Target,
  TargetType,
} from '@/types';
import { TypedEvent } from '@/utils/typed_event';

export interface GameActionEmitter {
  emitAction(action: GameAction, index: number): void;
}

export class GameServerContext implements GameContext {
  private _currentStateId: Id = 1 as Id;
  private _state: GameState;
  private _fieldContext: FieldContext;
  private _rng: RandomGenerator;
  private _timer: NodeJS.Timeout | null = null;
  private _cachedPlayerContext = new WeakMap<PlayerState, PlayerContext>();
  private _cachedFieldContext = new WeakMap<FieldState, FieldContext>();
  private _cachedCardContext = new WeakMap<CardState, CardContext<CardState>>();
  private _selectOptionCallbacks = new Map<number, (selectedIndex: number) => void>();
  private _selectHandCallbacks = new Map<number, (selectedIndexes: HandIndex[]) => void>();
  private _onAction = new TypedEvent<GameActionEvent>();

  constructor(private _record: GameRecord) {
    this._state = this.createInitialGameState();
    this._fieldContext = this.createOrCachedFieldContext();
    this._rng = prand.xoroshiro128plus(_record.seed);
  }

  get record(): Readonly<GameRecord> {
    return this._record;
  }
  get state(): Readonly<GameState> {
    return this._state;
  }
  get ally(): PlayerContext {
    return this.getPlayer(this._state.activeLeader);
  }
  get enemy(): PlayerContext {
    return this.getPlayer(BY_LEADER[this.state.activeLeader].enemyLeader);
  }
  get field(): FieldContext {
    return this._fieldContext;
  }
  get onAction() {
    return this._onAction;
  }

  protected createInitialGameState(): GameState {
    return {
      turnNumber: 1,
      turnWillEndAt: null,
      mulliganSwapped: {},
      field: {
        floorMap: {},
        objectMap: {},
      },
      activeLeader: this.record.first,
      effects: [],
      playerMap: {
        AL: this.createInitialPlayerState('AL', this.record.players.AL, this.record.first === 'AL'),
        BL: this.createInitialPlayerState('BL', this.record.players.BL, this.record.first !== 'AL'),
      },
      isFinished: false,
      winner: null,
    };
  }

  protected createInitialPlayerState(leader: LeaderPosition, player: GamePlayer, isFirst: boolean): PlayerState {
    const [library, hand] = this.createLibraryAndHandForLeader(leader, isFirst);
    return {
      position: leader,
      maxHP: PLAYER_MAX_HP,
      currentHP: PLAYER_MAX_HP,
      maxMP: 1,
      currentMP: 1,
      tentionCount: isFirst ? 0 : 2, // 後攻プレイヤーはテンション 2 からスタート
      hand,
      library,
      tentionSkill: getTentionSkillDefByJob(player.job).createState(this, leader),
      heroSkill: null,
      badges: [],
      weapon: null,
      tentionSkillCount: 0,
      fatigueCount: 0,
      baseProficiency: 0,
      attackCount: 0,
      turnAttackCount: 0,
      deadUnitDefIds: [],
      usedCardDefIds: [],
    };
  }

  protected createLibraryAndHandForLeader(leader: LeaderPosition, isFirst: boolean): [CardState[], CardState[]] {
    const cardDefIds = this.record.players[leader].cardDefIds;

    // まずはすべてカード実体化
    const library: CardState[] = cardDefIds.map((defId) => {
      const def = cardRegistry.getById(defId);
      return def.createState(this, leader);
    });

    // シャッフル
    for (let i = 0; i < library.length; i++) {
      const j = this.generateRandomInt(0, library.length);
      [library[i], library[j]] = [library[j], library[i]];
    }

    // 最初の手札作成
    const handNum = FIRST_HAND_NUM[isFirst ? 'first' : 'second'];
    const firstHands: CardState[] = [];
    // ヒーローカードは必ず手札に来るようにする
    // TODO: サマルトリアの王子だけ例外
    for (let i = library.length - 1; i >= 0; i--) {
      if (library[i].type === CardType.HERO) {
        const [card] = library.splice(i, 1);
        firstHands.push(card);
      }
      if (firstHands.length >= handNum) {
        break;
      }
    }
    if (firstHands.length < handNum) {
      // 足りない分をドロー
      const cards = library.splice(0, handNum - firstHands.length);
      firstHands.push(...cards);
    }

    return [library, firstHands];
  }

  updateState(newState: GameState): void {
    this._state = newState;
  }

  generateRandomInt(min: number, max: number): number {
    if (!this._rng) {
      this._rng = prand.xoroshiro128plus(this.record.seed);
    }
    const [value, next] = prand.uniformIntDistribution(min, max, this._rng);
    this._rng = next;
    return value;
  }

  generateStateID(): Id {
    return this._currentStateId++ as Id;
  }

  emitAction(action: GameAction): void {
    this._record.actions.push(action);
    this._onAction.emit({
      action,
      index: this._record.actions.length - 1,
    });
  }

  private clearTimer(): void {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  startGame(): void {
    this.emitAction({
      type: GameActionType.START,
      first: this._record.first,
      actor: this._record.first,
      hands: {
        AL: this._state.playerMap.AL.hand,
        BL: this._state.playerMap.BL.hand,
      },
      mulliganWillEndAt: getCurrentTime() + MULLIGAN_TIMEOUT_MS,
      timestamp: getCurrentTime(),
    });

    this._timer = setTimeout(() => {
      this._timer = null;
      this.endMulligan();
    }, MULLIGAN_TIMEOUT_MS);
  }

  endGame(winner: LeaderPosition | null): void {
    this.clearTimer();

    const timestamp = getCurrentTime();
    this.updateState({
      ...this.state,
      isFinished: true,
      winner,
    });

    this._record = {
      ...this._record,
      finishedAt: timestamp,
      winner,
    };

    this.emitAction({
      type: GameActionType.END,
      actor: this.state.activeLeader,
      winner,
      timestamp,
    });
  }

  playerMulligan(position: LeaderPosition, swapped: HandIndex[]): void {
    if (this.state.mulliganSwapped[position]) {
      throw new GameRuntimeError('Player has already mulliganed ' + position);
    }

    this.state.mulliganSwapped[position] = [...swapped];

    // 2人ともマリガン完了したかどうかチェック
    if (this.state.mulliganSwapped.AL && this.state.mulliganSwapped.BL) {
      // マリガン処理をする
      this.endMulligan();
    }
  }

  private endMulligan(): void {
    this.clearTimer();

    // マリガン処理をする
    if (this.state.mulliganSwapped.AL) {
      this.getPlayer('AL').mulligan(this.state.mulliganSwapped.AL);
    }
    if (this.state.mulliganSwapped.BL) {
      this.getPlayer('BL').mulligan(this.state.mulliganSwapped.BL);
    }

    this.emitAction({
      type: GameActionType.MULLIGAN,
      actor: this.ally.position,
      swapped: {
        AL: [],
        BL: [],
        ...this.state.mulliganSwapped,
      },
      timestamp: getCurrentTime(),
    });
  }

  playerSurrender(position: LeaderPosition): void {
    this.clearTimer();

    this.emitAction({
      type: GameActionType.SURRENDER,
      actor: position,
      timestamp: getCurrentTime(),
    });

    const winner = BY_LEADER[position].enemyLeader;
    this.endGame(winner);
  }

  playerEmote(position: LeaderPosition, emoteId: Id): void {
    this.emitAction({
      type: GameActionType.EMOTE,
      actor: position,
      emoteId,
      timestamp: getCurrentTime(),
    });
  }

  playerAttack(attacker: LeaderCellPosition, target: LeaderCellPosition): void {
    if (this.ally.positions.allyLeaderAndCells.indexOf(attacker) === -1) {
      throw new GameForbiddenOperationError(`GameServerContext.playerAttack: Attacker is not on the ally's side: ${attacker}`);
    }
    if (this.ally.positions.enemyLeaderAndCells.indexOf(target) === -1) {
      throw new GameForbiddenOperationError(`GameServerContext.playerAttack: Target is not on the enemy's side: ${target}`);
    }

    let attackTarget: AttackTarget;
    if (target === this.enemy.position) {
      attackTarget = {
        type: TargetType.LEADER,
        position: target,
      };
    } else {
      const targetUnit = this.field.getUnitAt(target as CellPosition);
      if (!targetUnit) {
        throw new GameRuntimeError(`GameServerContext.playerAttack: Trying to attack to no unit cell: ${target}`);
      }
      attackTarget = {
        type: TargetType.UNIT,
        unitId: targetUnit.state.id,
      };
    }

    if (attacker === this.ally.position) {
      // リーダーの攻撃
      const player = this.getPlayer(attacker);
      if (!player.canAttack()) {
        throw new GameForbiddenOperationError(`GameServerContext.playerAttack: Leader cannot attack`);
      }
      this.getPlayer(attacker).attack(attackTarget);
    } else {
      // ユニットの攻撃
      const attackerUnit = this.field.getUnitAt(attacker as CellPosition);
      if (!attackerUnit) {
        throw new GameRuntimeError(`GameServerContext.playerAttack: Trying to attack from no unit cell: ${attacker}`);
      }
      if (!attackerUnit.canAttack()) {
        throw new GameForbiddenOperationError(`GameServerContext.playerAttack: Unit cannot attack`);
      }
      attackerUnit.attack(attackTarget);
    }
  }

  playerTentionUp(position: LeaderPosition): void {
    if (this.ally.position !== position) {
      throw new GameForbiddenOperationError(`GameServerContext.playerTentionUp: Not active player`);
    }
    if (this.ally.state.tentionCount >= MAX_TENTION) {
      throw new GameForbiddenOperationError(`GameServerContext.playerTentionUp: already max tention`);
    }
    this.getPlayer(position).gainTention(1);
  }

  playerUseCard(position: LeaderPosition, cardId: Id, target?: Target): void {
    if (this.ally.position !== position) {
      throw new GameForbiddenOperationError(`GameServerContext.playerUseHand: Not active player`);
    }
    this.getPlayer(position).useCard(cardId, target);
  }

  playerSelectOption(position: LeaderPosition, selectId: Id, selectedIndex: number): void {
    const callback = this._selectOptionCallbacks.get(selectId);
    if (callback) {
      this._selectOptionCallbacks.delete(selectId);
      callback(selectedIndex);
    } else {
      throw new GameRuntimeError(`GameServerContext.playerSelectOption: Not a valid selectId`);
    }
  }

  playerSelectHand(position: LeaderPosition, selectId: Id, selectedIndexes: HandIndex[]): void {
    const callback = this._selectHandCallbacks.get(selectId);
    if (callback) {
      this._selectHandCallbacks.delete(selectId);
      callback(selectedIndexes);
    } else {
      throw new GameRuntimeError(`GameServerContext.playerSelectHand: Not a valid selectId`);
    }
  }

  protected createOrCachedPlayerContext(leader: LeaderPosition): PlayerContext {
    const playerState = this._state.playerMap[leader];

    const context = this._cachedPlayerContext.get(playerState);
    if (context) {
      return context;
    } else {
      const newContext = new GamePlayerContext(this, playerState);
      this._cachedPlayerContext.set(playerState, newContext);
      return newContext;
    }
  }

  protected createOrCachedFieldContext(): FieldContext {
    const fieldState = this.state.field;

    const context = this._cachedFieldContext.get(fieldState);
    if (context) {
      return context;
    } else {
      const newContext = new GameFieldContext(this, fieldState);
      this._cachedFieldContext.set(fieldState, newContext);
      return newContext;
    }
  }

  getPlayer(position: LeaderPosition): PlayerContext {
    return this.createOrCachedPlayerContext(position);
  }

  getCardContext<T extends CardState>(card: T): CardContext<T> {
    const context = this._cachedCardContext.get(card);
    if (context) {
      return context as CardContext<T>;
    } else {
      const newContext = new GameCardContext(this, this.getPlayer(card.owner), card);
      this._cachedCardContext.set(card, newContext);
      return newContext;
    }
  }

  checkConditions(): void {
    let retry = false;
    do {
      retry = false;

      // 勝敗チェック
      const winners = { AL: false, BL: false };
      LEADERS.forEach((leader) => {
        if (this.getPlayer(leader).currentHP <= 0) {
          winners[leader] = true;
        }
      });

      let winner: LeaderPosition | null | undefined = undefined;
      if (winners.AL && winners.BL) {
        // 両者敗北 (ドロー)
        winner = null;
      } else if (winners.AL || winners.BL) {
        // 通常の決着
        winner = winners.AL ? 'BL' : 'AL';
      }
      if (winner !== undefined) {
        this.endGame(winner);
        break;
      }

      for (const obj of Object.values(this.field.state.objectMap)) {
        switch (obj.type) {
          case 'UNIT': {
            const unit = this.field.getFieldUnitContext(obj);
            const maxHP = unit.getCalculatedMaxHP();
            if (unit.currentHP <= 0 || maxHP <= 0) {
              // ユニットの残りHPが0、最大HPが0の場合は死亡させる
              unit.destroy();
              retry = true;
            } else if (unit.currentHP > maxHP) {
              // 残りHPが最大HPより多くなる場合は最大HPに合わせる
              unit.currentHP = maxHP;
              retry = true;
            }
            break;
          }
          case 'BUILDING': {
            const building = this.field.getFieldBuildingContext(obj);
            if (building.state.durability <= 0) {
              // 耐久度が 0 の場合は破壊する
              building.destroy();
              retry = true;
            }
            break;
          }
        }
      }
    } while (retry);

    // ターン終了時間が過ぎていたらターン終了
    if (this.state.turnWillEndAt && getCurrentTime() >= this.state.turnWillEndAt) {
      this.endCurrentTurn();
    }
  }

  endCurrentTurn(): void {
    this.clearTimer();
    const turnWillEndAt = getCurrentTime() + TURN_TIMEOUT_MS;

    // アクティブプレイヤー切り替え
    this.updateState({
      ...this.state,
      activeLeader: this.enemy.position,
      turnNumber: this.state.turnNumber + 1,
      turnWillEndAt,
    });

    this.emitAction({
      type: GameActionType.TURN_START,
      actor: this.state.activeLeader,
      turnNumber: this.state.turnNumber,
      turnWillEndAt,
      timestamp: getCurrentTime(),
    });

    // ターン開始時のドロー
    this.ally.drawCard(1);

    // タイマーをセット
    this._timer = setTimeout(() => {
      this.checkConditions();
    }, TURN_TIMEOUT_MS);
  }

  selectOption(card: CardState, options: [SelectOption, SelectOption, ...SelectOption[]]): void {
    const def = cardRegistry.getById(card.cardDefId);

    const selectId = this.generateStateID();
    const callback = (selectedIndex: number) => {
      this._selectOptionCallbacks.delete(selectId);
      def.onOptionSelected(this, card, selectedIndex);
    };
    this._selectOptionCallbacks.set(selectId, callback);

    this.emitAction({
      type: GameActionType.SELECT_OPTION,
      actor: card.owner,
      selectId,
      options,
      timestamp: getCurrentTime(),
    });
  }

  selectHand(card: CardState, numberOfCards: number, selectableHands?: HandIndex[]): void {
    if (!selectableHands) {
      // 省略時は全手札が選択対象
      selectableHands = this.getPlayer(card.owner).state.hand.map((_, n) => n) as HandIndex[];
    }
    if (selectableHands.length === 0) {
      throw new GameRuntimeError('GameServerContext.selectHand: No selectable hands');
    }

    const def = cardRegistry.getById(card.cardDefId);

    const selectId = this.generateStateID();
    const callback = (selectedIndexes: HandIndex[]) => {
      this._selectHandCallbacks.delete(selectId);
      def.onHandSelected(this, card, selectedIndexes);
    };
    this._selectHandCallbacks.set(selectId, callback);

    this.emitAction({
      type: GameActionType.SELECT_HAND,
      actor: card.owner,
      selectId,
      numberOfCards,
      selectableHands,
      timestamp: getCurrentTime(),
    });
  }

  fortune(card: CardState, options: [SelectOption, SelectOption, ...SelectOption[]]): void {
    // なぜかテンプレート指定しないと型推論がおかしくなる...
    const cardDef = cardRegistry.getById(card.cardDefId);
    const trueDef = effectRegistry.getByDef(FortuneTrueEffect);
    const superTrueDef = effectRegistry.getByDef(FortuneSuperTrueEffect);

    const trueEffect = this.findEffectByDef(trueDef, this.ally.asTarget);
    const superTrueEffect = this.findEffectByDef(superTrueDef, this.ally.asTarget);

    if (superTrueEffect) {
      // 超必中モードなのですべて発動とする
      for (let i = 0; i < options.length; i++) {
        cardDef.onOptionSelected(this, card, i);
      }
    } else if (trueEffect) {
      // 必中モードなので効果を選ぶ
      this.selectOption(card, options);
    } else {
      // どちらでもないのでランダムに選択される
      const index = this.generateRandomInt(0, options.length - 1);
      cardDef.onOptionSelected(this, card, index);
    }
  }

  addEffect(effect: EffectState): void {
    this.updateState({
      ...this.state,
      effects: [...this.state.effects, effect],
    });

    // イベント呼び出し
    const def = effectRegistry.getById(effect.effectDefId);
    def.onAdded(this, effect);
  }

  removeEffect(effect: EffectState | Id): void {
    const effectId = typeof effect === 'number' ? effect : effect.id;
    const index = this._state.effects.findIndex((e) => e.id === effectId);
    if (index === -1) {
      throw new GameRuntimeError('Failed to remove effect');
    }

    const removedEffect = this._state.effects[index];
    const def = effectRegistry.getById(removedEffect.effectDefId);

    const newEffects = [...this.state.effects];
    newEffects.splice(index, 1);

    this.updateState({
      ...this.state,
      effects: newEffects,
    });

    // イベント呼び出し
    def.onRemoved(this, removedEffect);
  }

  removeAllEffectsBySource(source: EffectSource): void {
    const removedEffects: EffectState[] = [];
    const newEffects: EffectState[] = [];

    for (const effect of this._state.effects) {
      if (isSameTarget(effect.source, source)) {
        removedEffects.push(effect);
      } else {
        newEffects.push(effect);
      }
    }

    this.updateState({
      ...this.state,
      effects: newEffects,
    });

    // イベント呼び出し
    for (const effect of removedEffects) {
      const def = effectRegistry.getById(effect.effectDefId);
      def.onRemoved(this, effect);
    }
  }

  removeAllEffectsByTarget(target: EffectTarget): void {
    const removedEffects: EffectState[] = [];
    const newEffects: EffectState[] = [];

    for (const effect of this._state.effects) {
      if (!effect.target) continue;
      if (isSameTarget(effect.target, target)) {
        removedEffects.push(effect);
      } else {
        newEffects.push(effect);
      }
    }

    this.updateState({
      ...this.state,
      effects: newEffects,
    });

    // イベント呼び出し
    for (const effect of removedEffects) {
      const def = effectRegistry.getById(effect.effectDefId);
      def.onRemoved(this, effect);
    }
  }

  findEffectByDef<T extends Storage | null>(
    effectDef: EffectDefinition<T> | DefinitionClass<EffectDefinition>,
    target?: EffectTarget,
  ): EffectState<T> | undefined {
    const foundEffect = this._state.effects.find((effect) => {
      if (!effect.target) return false;
      if (effectDef.id !== effect.effectDefId) return false;
      if (target) {
        return isSameTarget(target, effect.target);
      } else {
        return true;
      }
    });
    // State の T は Definition の T と必ず一致するので as キャストして OK
    return foundEffect as EffectState<T> | undefined;
  }

  findAllEffectsByDef<T extends Storage | null>(
    effectDef: EffectDefinition<T> | DefinitionClass<EffectDefinition>,
    target?: EffectTarget,
  ): EffectState<T>[] {
    const foundEffects = this._state.effects.filter((effect) => {
      if (!effect.target) return false;
      if (effectDef.id !== effect.effectDefId) return false;
      if (target) {
        return isSameTarget(target, effect.target);
      } else {
        return false;
      }
    });
    return foundEffects as EffectState<T>[];
  }

  findAllEffectsByTarget(target: EffectTarget): EffectState[] {
    const foundEffects = this._state.effects.filter((effect) => {
      if (!effect.target) return false;
      return isSameTarget(target, effect.target);
    });
    return foundEffects;
  }

  findAllEffectsByTargetOrAny(target: EffectTarget): EffectState[] {
    const foundEffects = this._state.effects.filter((effect) => {
      if (!effect.target) return true;
      return isSameTarget(target, effect.target);
    });
    return foundEffects;
  }
}
