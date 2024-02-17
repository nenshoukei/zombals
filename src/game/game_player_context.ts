import { GameCardContext } from './game_card_context';
import { GameEquippedWeaponContext } from './game_equipped_weapon_context';
import { MAX_HAND, MAX_TENTION } from '@/config/common';
import { PowerChangeEffect, PowerChangeEffectStorage } from '@/definition';
import { CounterMinusEffect, CounterMinusEffectStorage } from '@/definition/effect/013_counter_minus_effect';
import { CounterNoneEffect } from '@/definition/effect/014_counter_none_effect';
import { DoubleAttackEffect } from '@/definition/effect/015_double_attack_effect';
import { badgeRegistry, cardRegistry } from '@/registry';
import {
  AttackTarget,
  BadgeState,
  BY_LEADER,
  CardContext,
  CardState,
  CardType,
  DamageSource,
  DamageSourceLeader,
  DamageSourceType,
  EffectSource,
  EffectSourceType,
  EquippedWeaponContext,
  EquippedWeaponState,
  FatigueCardState,
  GameActionType,
  GameContext,
  GameRuntimeError,
  getCurrentTime,
  HandIndex,
  HeroSkillCardState,
  Id,
  LeaderStatsUpdateAction,
  PlayerContext,
  PlayerState,
  SidePositionList,
  Target,
  TargetLeader,
  TargetType,
  TentionSkillCardState,
  WeaponCardDefinition,
  WeaponCardState,
} from '@/types';

export class GamePlayerContext implements PlayerContext {
  private _cachedTentionSkillContext: GameCardContext<TentionSkillCardState> | null = null;
  private _cachedHeroSkillContext: GameCardContext<HeroSkillCardState> | null = null;
  private _cachedWeaponContext: EquippedWeaponContext | null = null;

  constructor(
    private _game: GameContext,
    private _state: PlayerState,
  ) {}

  get state() {
    return this._state;
  }

  get position() {
    return this._state.position;
  }

  get asTarget(): TargetLeader {
    return {
      type: TargetType.LEADER,
      position: this.position,
    };
  }

  get asDamageSource(): DamageSourceLeader {
    return {
      type: DamageSourceType.LEADER,
      position: this.position,
    };
  }

  get asEffectSource(): EffectSource {
    return {
      type: EffectSourceType.LEADER,
      position: this.position,
    };
  }

  get positions(): Readonly<SidePositionList> {
    return BY_LEADER[this.position];
  }

  get maxHP(): number {
    return this._state.maxHP;
  }

  get currentHP(): number {
    return this._state.currentHP;
  }

  get maxMP(): number {
    return this._state.maxMP;
  }

  get currentMP(): number {
    return this._state.currentMP;
  }

  get tentionCount(): number {
    return this._state.tentionCount;
  }

  get tentionSkill(): CardContext<TentionSkillCardState> | null {
    if (!this.state.tentionSkill) {
      this._cachedTentionSkillContext = null;
      return null;
    }
    if (!this._cachedTentionSkillContext || this._cachedTentionSkillContext.state !== this.state.tentionSkill) {
      this._cachedTentionSkillContext = new GameCardContext<TentionSkillCardState>(this._game, this, this.state.tentionSkill);
    }
    return this._cachedTentionSkillContext;
  }

  get heroSkill(): CardContext<HeroSkillCardState> | null {
    if (!this.state.heroSkill) {
      this._cachedHeroSkillContext = null;
      return null;
    }
    if (!this._cachedHeroSkillContext || this._cachedHeroSkillContext.state !== this.state.heroSkill) {
      this._cachedHeroSkillContext = new GameCardContext<HeroSkillCardState>(this._game, this, this.state.heroSkill);
    }
    return this._cachedHeroSkillContext;
  }

  get weapon(): EquippedWeaponContext | null {
    if (!this.state.weapon) {
      this._cachedWeaponContext = null;
      return null;
    }
    if (!this._cachedWeaponContext || this._cachedWeaponContext.state !== this.state.weapon) {
      this._cachedWeaponContext = new GameEquippedWeaponContext(this._game, this, this.state.weapon);
    }
    return this._cachedWeaponContext;
  }

  updateState(newState: PlayerState): void {
    let statsChanged = false;
    if (
      this._state.maxHP !== newState.maxHP ||
      this._state.currentHP !== newState.currentHP ||
      this._state.maxMP !== newState.maxMP ||
      this._state.currentMP !== newState.currentMP ||
      this.tentionCount !== newState.tentionCount
    ) {
      statsChanged = true;
    }

    this._state = newState;
    this._game.updateState({
      ...this._game.state,
      playerMap: {
        ...this._game.state.playerMap,
        [this.position]: newState,
      },
    });

    if (statsChanged) {
      this.statsChanged();
    }
  }

  getCalculatedPower(): number {
    const effects = this._game.findAllEffectsByTarget(this.asTarget);
    let power = 0; // 基本は 0 パワー

    if (this.weapon) {
      // 装備武器の攻撃力を使う
      power += this.weapon.getCalculatedPower();
    }

    for (const effect of effects) {
      if (effect.effectDefId === PowerChangeEffect.id) {
        power = Math.max(0, power + (effect.storage as PowerChangeEffectStorage).delta);
      }
    }
    return power;
  }

  mulligan(swapped: HandIndex[]): void {
    const newLibrary = [...this.state.library];
    for (const handIndex of swapped) {
      if (handIndex < 0 || handIndex >= this.state.hand.length) {
        throw new GameRuntimeError(`Mulligan out of index: ${handIndex}`);
      }

      // ランダムな位置に挿入
      const card = this.state.hand[handIndex];
      this._game.generateRandomInt(0, newLibrary.length); // 末尾も含めるため -1 していない
      newLibrary.splice(0, handIndex, card);
    }

    const newHand = [...this.state.hand];
    const sorted = [...swapped].sort();
    for (let i = sorted.length - 1; i >= 0; i--) {
      newHand.splice(sorted[i], 1);
    }

    this.updateState({
      ...this.state,
      library: newLibrary,
      hand: newHand,
    });
  }

  drawCard(numberOfCards: number): void {
    if (numberOfCards <= 0) return;

    const library = [...this.state.library];
    const drawnCards: (CardState | FatigueCardState)[] = [];
    for (let i = 0; i < numberOfCards; i++) {
      const popped = library.pop();
      if (popped) {
        drawnCards.push(popped);
      } else {
        drawnCards.push({
          type: CardType.FATIGUE,
        });
      }
    }
    if (drawnCards.length === 0) return;

    for (const card of drawnCards) {
      if (card.type === CardType.FATIGUE) {
        // ファティーグダメージを受ける (受ける度にダメージ加算)
        this.updateState({
          ...this.state,
          fatigueCount: this.state.fatigueCount + 1,
        });
        this.gainDamage(this.state.fatigueCount, {
          type: DamageSourceType.LEADER,
          position: this.position,
        });
      } else if (this.state.hand.length < MAX_HAND) {
        // 普通にドロー
        this.updateState({
          ...this.state,
          hand: [...this.state.hand, card],
        });
        this._game.emitAction({
          type: GameActionType.DRAW,
          card: card,
          actor: this.position,
          timestamp: getCurrentTime(),
        });
      } else {
        // 手札あふれ
        this._game.emitAction({
          type: GameActionType.DISCARD,
          cards: [card],
          actor: this.position,
          timestamp: getCurrentTime(),
        });
      }
    }
  }

  addCardsToHand(cards: CardState[]): void {
    const newLibrary = [...this.state.library];
    const addCards: CardState[] = [];
    for (const card of cards) {
      if (card.owner !== this.position) {
        throw new GameRuntimeError("GamePlayerContext.addCardsToHand: Adding opposite player's card");
      }
      if (this.state.hand.some((hc) => hc.id === card.id)) {
        // すでに手札にある場合は何もしない
        continue;
      }

      const index = newLibrary.findIndex((lc) => lc.id === card.id);
      if (index >= 0) {
        newLibrary.splice(index, 1);
      }
      addCards.push(card);
    }

    // 手札からあふれるカードは捨てる
    const discardCards = addCards.splice(MAX_HAND - this.state.hand.length);

    if (addCards.length > 0) {
      this.updateState({
        ...this.state,
        hand: [...this.state.hand, ...addCards],
      });

      this._game.emitAction({
        type: GameActionType.ADD_CARD,
        actor: this.position,
        cards: addCards,
        timestamp: getCurrentTime(),
      });
    }
    if (discardCards.length > 0) {
      this._game.emitAction({
        type: GameActionType.DISCARD,
        actor: this.position,
        cards: discardCards,
        timestamp: getCurrentTime(),
      });
    }
  }

  addCopyCardsToHand(cards: CardState[]): void {
    // コピーを作成
    const copyCards = cards.map((card): CardState => {
      return {
        ...card,
        id: this._game.generateStateID(),
        owner: this.position,
        isToken: true,
      };
    });
    this.addCardsToHand(copyCards);
  }

  useCard(card: Id | CardState, target?: Target): CardState {
    const cardId = typeof card === 'number' ? card : card.id;

    let usingCard: CardState;
    let newHands = this.state.hand;
    let newUsedCardDefIds = this.state.usedCardDefIds;

    if (cardId === this.state.tentionSkill?.id) {
      // テンションスキル
      usingCard = this.state.tentionSkill;
    } else if (cardId === this.state.heroSkill?.id) {
      // ヒーロースキル
      usingCard = this.state.heroSkill;
    } else {
      // 手札
      const index = this.state.hand.findIndex((hc) => hc.id === cardId);
      if (index < 0) {
        throw new GameRuntimeError('GamePlayerContext.useCard: using a card not in hand');
      }

      // 手札から削除
      newHands = [...this.state.hand];
      const spliced = newHands.splice(index, 1);
      usingCard = spliced[0];
      newUsedCardDefIds = [...this.state.usedCardDefIds, usingCard.cardDefId];
    }

    if (usingCard.cost > this.state.currentMP) {
      throw new GameRuntimeError('GamePlayerContext.useCard: using a card with over cost');
    }

    this.updateState({
      ...this.state,
      currentMP: Math.max(0, this.state.currentMP - usingCard.cost),
      hand: newHands,
      usedCardDefIds: newUsedCardDefIds,
    });

    this._game.emitAction({
      type: GameActionType.USE_CARD,
      actor: this.position,
      card: usingCard,
      target,
      timestamp: getCurrentTime(),
    });

    // カード効果を適用
    const cardDef = cardRegistry.getById(usingCard.cardDefId);
    cardDef.use(this._game, usingCard, target);

    return usingCard;
  }

  gainTention(tentionUpCount: number): void {
    const actualTentionUpCount = Math.min(MAX_TENTION - this.state.tentionCount, tentionUpCount);
    if (actualTentionUpCount <= 0) return;

    this.updateState({
      ...this.state,
      tentionCount: this.state.tentionCount + actualTentionUpCount,
    });
    this._game.emitAction({
      type: GameActionType.TENTION_UP,
      actor: this.position,
      tentionUpCount: actualTentionUpCount,
      timestamp: getCurrentTime(),
    });
  }

  setTentionCount(newTentionCount: number): void {
    const actualTentionCount = Math.max(0, Math.min(MAX_TENTION, newTentionCount));
    if (actualTentionCount === this.state.tentionCount) return;

    this.updateState({
      ...this.state,
      tentionCount: actualTentionCount,
    });
    this._game.emitAction({
      type: GameActionType.TENTION_SET,
      actor: this.position,
      newTentionCount: actualTentionCount,
      timestamp: getCurrentTime(),
    });
  }

  equipWeaponCard(weapon: WeaponCardState): EquippedWeaponContext {
    const equippedWeapon: EquippedWeaponState = {
      id: this._game.generateStateID(),
      weaponDefId: weapon.cardDefId,
      owner: this.position,
      basePower: weapon.power,
      durability: weapon.durability,
    };

    this.updateState({
      ...this.state,
      weapon: equippedWeapon,
    });

    this._game.emitAction({
      type: GameActionType.EQUIP_WEAPON,
      actor: this.position,
      weapon: equippedWeapon,
      timestamp: getCurrentTime(),
    });

    return this.weapon!;
  }

  equipWeaponDef(weaponDef: WeaponCardDefinition): EquippedWeaponContext {
    const weaponCard = weaponDef.createState(this._game, this.position);
    return this.equipWeaponCard(weaponCard);
  }

  breakWeapon(): void {
    const weapon = this.weapon;
    if (!weapon) return;
    const weaponId = weapon.state.id;

    this.updateState({
      ...this.state,
      weapon: null,
    });

    // この装備武器による持続効果をすべて削除
    this._game.removeAllEffectsBySource({ type: TargetType.EQUIP_WEAPON, weaponId });

    this._game.emitAction({
      type: GameActionType.BREAK_WEAPON,
      actor: this.position,
      timestamp: getCurrentTime(),
    });
  }

  addDeadUnitDefId(unitDefId: Id): void {
    this.updateState({
      ...this.state,
      deadUnitDefIds: [...this.state.deadUnitDefIds, unitDefId],
    });
  }

  setTentionSkill(newTentionSkill: TentionSkillCardState): void {
    this.updateState({
      ...this.state,
      tentionSkill: newTentionSkill,
    });
    this._game.emitAction({
      type: GameActionType.TENTION_SKILL_CHANGED,
      actor: this.position,
      tentionSkill: newTentionSkill,
      timestamp: getCurrentTime(),
    });
  }

  setHeroSkill(newHeroSkill: HeroSkillCardState): void {
    this.updateState({
      ...this.state,
      heroSkill: newHeroSkill,
    });
    this._game.emitAction({
      type: GameActionType.HERO_SKILL_CHANGED,
      actor: this.position,
      heroSkill: newHeroSkill,
      timestamp: getCurrentTime(),
    });
  }

  addBadge(badge: BadgeState): void {
    if (badge.owner !== this.position) {
      throw new GameRuntimeError('GamePlayerContext.addBadge: Owner mismatch');
    }

    this.updateState({
      ...this.state,
      badges: [...this.state.badges, badge],
    });

    this._game.emitAction({
      type: GameActionType.BADGE_ADDED,
      actor: this.position,
      badge,
      timestamp: getCurrentTime(),
    });

    const def = badgeRegistry.getById(badge.badgeDefId);
    def.onAdded(this._game, badge);
  }

  removeBadge(badge: BadgeState): void {
    const index = this.state.badges.findIndex((b) => b.id === badge.id);
    if (index < 0) return;

    const newBadges = [...this.state.badges];
    const [removedBadge] = newBadges.splice(index, 1);

    this.updateState({
      ...this.state,
      badges: newBadges,
    });

    // このバッジによる持続効果をすべて削除
    this._game.removeAllEffectsBySource({ type: TargetType.BADGE, badgeId: removedBadge.id });

    this._game.emitAction({
      type: GameActionType.BADGE_REMOVED,
      actor: this.position,
      badges: [removedBadge],
      timestamp: getCurrentTime(),
    });

    const def = badgeRegistry.getById(removedBadge.badgeDefId);
    def.onRemoved(this._game, badge);
  }

  removeRandomBadges(numberOfBadges: number): void {
    if (numberOfBadges <= 0) return;

    const newBadges = [...this.state.badges];
    const removedBadges: BadgeState[] = [];
    for (let i = 0; i < Math.min(numberOfBadges, newBadges.length); i++) {
      const index = this._game.generateRandomInt(0, newBadges.length - 1);
      const [removedBadge] = newBadges.splice(index, 1);
      removedBadges.push(removedBadge);
    }

    this.updateState({
      ...this.state,
      badges: newBadges,
    });

    for (const badge of removedBadges) {
      this._game.removeAllEffectsBySource({ type: TargetType.BADGE, badgeId: badge.id });
    }

    this._game.emitAction({
      type: GameActionType.BADGE_REMOVED,
      actor: this.position,
      badges: removedBadges,
      timestamp: getCurrentTime(),
    });

    for (const badge of removedBadges) {
      const def = badgeRegistry.getById(badge.badgeDefId);
      def.onRemoved(this._game, badge);
    }
  }

  private lastNotifiedStats: LeaderStatsUpdateAction | undefined;
  statsChanged(): void {
    const newStats: LeaderStatsUpdateAction = {
      type: GameActionType.LEADER_STATS_UPDATE,
      actor: this.position,
      power: this.getCalculatedPower(),
      maxHP: this.maxHP,
      currentHP: this.currentHP,
      maxMP: this.maxMP,
      currentMP: this.currentMP,
      tentionCount: this.tentionCount,
      timestamp: getCurrentTime(),
    };

    if (
      !this.lastNotifiedStats ||
      this.lastNotifiedStats.power !== newStats.power ||
      this.lastNotifiedStats.maxHP !== newStats.maxHP ||
      this.lastNotifiedStats.currentHP !== newStats.currentHP ||
      this.lastNotifiedStats.maxMP !== newStats.maxMP ||
      this.lastNotifiedStats.currentHP !== newStats.currentHP ||
      this.lastNotifiedStats.tentionCount !== newStats.tentionCount
    ) {
      this._game.emitAction(newStats);
      this.lastNotifiedStats = newStats;
    }
  }

  canAttack(): boolean {
    // 攻撃力 0 なら攻撃不可
    if (this.getCalculatedPower() === 0) return false;

    // 攻撃回数が問題ないかチェック
    if (this.state.turnAttackCount === 1) {
      // 2回行動がついているかどうかチェック
      const doubleAttack = this._game.findEffectByDef(DoubleAttackEffect, this.asTarget);
      if (!doubleAttack) {
        return false;
      }
    } else if (this.state.turnAttackCount >= 2) {
      return false;
    }
    return true;
  }

  attack(target: AttackTarget): void {
    if (this.state.turnAttackCount === 1) {
      const doubleAttack = this._game.findEffectByDef(DoubleAttackEffect, this.asTarget);
      if (!doubleAttack) {
        throw new GameRuntimeError(`GamePlayerContext.attack: Trying to attack twice in a turn`);
      }
    } else if (this.state.turnAttackCount >= 2) {
      throw new GameRuntimeError(`GamePlayerContext.attack: Trying to attack multiple times in a turn`);
    }

    this.updateState({
      ...this.state,
      turnAttackCount: this.state.turnAttackCount + 1,
    });

    switch (target.type) {
      case TargetType.LEADER:
        this._game.emitAction({
          type: GameActionType.ATTACK,
          actor: this.position,
          ataccker: this.position,
          target: target.position,
          timestamp: getCurrentTime(),
        });
        this._game.getPlayer(target.position).gainDamage(this.getCalculatedPower(), this.asDamageSource);
        break;

      case TargetType.UNIT: {
        const unit = this._game.field.getUnitById(target.unitId);
        if (!unit) return;

        this._game.emitAction({
          type: GameActionType.ATTACK,
          actor: this.position,
          ataccker: this.position,
          target: unit.position,
          timestamp: getCurrentTime(),
        });

        unit.gainDamage(this.getCalculatedPower(), this.asDamageSource);

        let counterDamage = unit.getCalculatedPower();
        for (const effect of this._game.findAllEffectsByTarget(this.asTarget)) {
          if (effect.effectDefId === CounterNoneEffect.id) {
            counterDamage = 0;
            break;
          } else if (effect.effectDefId === CounterMinusEffect.id) {
            counterDamage = Math.max(0, counterDamage - (effect.storage as CounterMinusEffectStorage).minusDamage);
          }
        }
        this.gainDamage(counterDamage, unit.asDamageSource);
      }
    }
  }

  gainDamage(damage: number, _source: DamageSource): number {
    if (damage < 0) {
      throw new GameRuntimeError('GamePlayerContext.gainDamage: negative damage ' + damage);
    }

    const actualDamage = Math.min(damage, this.state.currentHP);

    this.updateState({
      ...this.state,
      currentHP: this.state.currentHP - actualDamage,
    });
    this._game.emitAction({
      type: GameActionType.LEADER_GAIN_DAMAGE,
      actor: this.position,
      damage: actualDamage,
      timestamp: getCurrentTime(),
    });

    return actualDamage;
  }

  gainHeal(heal: number, _source: DamageSource): number {
    if (heal < 0) {
      throw new GameRuntimeError('GamePlayerContext.gainHeal: negative heal ' + heal);
    }

    const actualHeal = Math.min(heal, this.state.maxHP - this.state.currentHP);

    this.updateState({
      ...this.state,
      currentHP: this.state.currentHP + actualHeal,
    });
    this._game.emitAction({
      type: GameActionType.LEADER_GAIN_HEAL,
      actor: this.position,
      heal: actualHeal,
      timestamp: getCurrentTime(),
    });

    return actualHeal;
  }
}
