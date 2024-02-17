import {
  DoubleAttackEffect,
  HasteEffect,
  PowerChangeEffect,
  PowerChangeEffectStorage,
  StatsChangeEffect,
  StatsChangeEffectStorage,
  StatsSetEffect,
  StatsSetEffectStorage,
  StealthEffect,
  UnmovableEffect,
} from '@/definition';
import { CounterMinusEffect, CounterMinusEffectStorage } from '@/definition/effect/013_counter_minus_effect';
import { CounterNoneEffect } from '@/definition/effect/014_counter_none_effect';
import { SnipeEffect } from '@/definition/effect/018_snipe_effect';
import { DarkClothEffect } from '@/definition/effect/101_dark_cloth_effect';
import { effectRegistry } from '@/registry';
import {
  AttackTarget,
  CELL_TO_COLUMN,
  CELL_TO_ROW,
  CELL_TO_SIDE_ROW,
  CellPosition,
  ColumnPosition,
  DamageSource,
  DamageSourceType,
  DamageSourceUnit,
  EffectEndTiming,
  EffectSource,
  EffectSourceType,
  FieldContext,
  FieldUnitContext,
  FieldUnitState,
  GameActionType,
  GameContext,
  GameRuntimeError,
  getCurrentTime,
  RowPosition,
  SideRowPosition,
  TargetType,
  TargetUnit,
  UnitStatsUpdateAction,
} from '@/types';

export class GameFieldUnitContext implements FieldUnitContext {
  constructor(
    private _game: GameContext,
    private _field: FieldContext,
    private _state: FieldUnitState,
  ) {}

  get state() {
    return this._state;
  }

  get position(): CellPosition {
    const position = this._field.getPositionOfObject(this._state);
    if (!position) {
      throw new GameRuntimeError('GameFieldUnitContext.position: not in field');
    }
    return position;
  }

  get row(): RowPosition {
    return CELL_TO_ROW[this.position];
  }

  get column(): ColumnPosition {
    return CELL_TO_COLUMN[this.position];
  }

  get sideRow(): SideRowPosition {
    return CELL_TO_SIDE_ROW[this.position];
  }

  get asTarget(): Readonly<TargetUnit> {
    return {
      type: TargetType.UNIT,
      unitId: this.state.id,
    };
  }

  get asEffectSource(): EffectSource {
    return {
      type: EffectSourceType.UNIT,
      unitId: this.state.id,
    };
  }

  get asDamageSource(): DamageSourceUnit {
    return {
      type: DamageSourceType.UNIT,
      position: this.position,
    };
  }

  get currentHP(): number {
    return this.state.currentHP;
  }

  set currentHP(newHP) {
    if (newHP === this.state.currentHP) return;
    this.updateState({
      ...this.state,
      currentHP: newHP,
    });
  }

  updateState(newState: FieldUnitState): void {
    let statsChanged = false;
    if (
      this._state.baseMaxHP !== newState.baseMaxHP ||
      this._state.basePower !== newState.basePower ||
      this._state.currentHP !== newState.currentHP
    ) {
      statsChanged = true;
    }

    this._state = newState;
    this._field.updateFieldObjectState(newState);

    if (statsChanged) {
      this.statsChanged();
    }
  }

  getCalculatedPower(): number {
    let power = this.state.basePower;
    for (const effect of this._game.findAllEffectsByTargetOrAny(this.asTarget)) {
      if (effect.effectDefId === PowerChangeEffect.id) {
        power = Math.max(0, power + (effect.storage as PowerChangeEffectStorage).delta);
      } else if (effect.effectDefId === StatsChangeEffect.id) {
        power = Math.max(0, power + (effect.storage as StatsChangeEffectStorage).powerDelta);
      } else if (effect.effectDefId === StatsSetEffect.id) {
        const newPower = (effect.storage as StatsSetEffectStorage).power;
        if (newPower !== null) power = Math.max(0, newPower);
      }
    }
    return power;
  }

  getCalculatedMaxHP(): number {
    let maxHP = this.state.baseMaxHP;
    for (const effect of this._game.findAllEffectsByTargetOrAny(this.asTarget)) {
      if (effect.effectDefId === StatsChangeEffect.id) {
        maxHP = Math.max(0, maxHP + (effect.storage as StatsChangeEffectStorage).maxHPDelta);
      } else if (effect.effectDefId === StatsSetEffect.id) {
        const newMaxHP = (effect.storage as StatsSetEffectStorage).maxHP;
        if (newMaxHP !== null) maxHP = Math.max(0, newMaxHP);
      }
    }
    return maxHP;
  }

  isStealth(): boolean {
    return this._game.findEffectByDef(StealthEffect, this.asTarget) !== null;
  }

  isDarkClothed(): boolean {
    return this._game.findEffectByDef(DarkClothEffect, this.asTarget) !== null;
  }

  isMovable(): boolean {
    if (this.isDarkClothed()) return false;
    // 移動不可エフェクトがついていなければ移動可能
    return this._game.findEffectByDef(UnmovableEffect, this.asTarget) === null;
  }

  changeStats(powerDelta: number, maxHPDelta: number, source: EffectSource, endTiming?: EffectEndTiming): void {
    if (this.isDarkClothed()) return;
    const def = effectRegistry.getByDef(StatsChangeEffect);
    const effect = def.createState({
      ctx: this._game,
      target: this.asTarget,
      source,
      owner: this.state.owner,
      initialStorage: { powerDelta, maxHPDelta },
      endTiming,
    });
    this._game.addEffect(effect);
  }

  setStats(power: number | null, maxHP: number | null, source: EffectSource, endTiming?: EffectEndTiming): void {
    if (this.isDarkClothed()) return;
    const def = effectRegistry.getByDef(StatsSetEffect);
    const effect = def.createState({
      ctx: this._game,
      target: this.asTarget,
      source,
      owner: this.state.owner,
      initialStorage: { power, maxHP },
      endTiming,
    });
    this._game.addEffect(effect);
  }

  destroy(): void {
    if (this.isDarkClothed()) return;
    this._field.removeObject(this.state, 'DESTROYED');
  }

  exile(): void {
    if (this.isDarkClothed()) return;
    this._field.removeObject(this.state, 'EXILED');
  }

  private lastNotifiedStats: UnitStatsUpdateAction | undefined;
  statsChanged(): void {
    const newStats: UnitStatsUpdateAction = {
      type: GameActionType.UNIT_STATS_UPDATE,
      actor: this.state.owner,
      position: this.position,
      maxHP: this.getCalculatedMaxHP(),
      power: this.getCalculatedPower(),
      currentHP: this.currentHP,
      timestamp: getCurrentTime(),
    };
    if (
      !this.lastNotifiedStats ||
      this.lastNotifiedStats.maxHP !== newStats.maxHP ||
      this.lastNotifiedStats.power !== newStats.power ||
      this.lastNotifiedStats.currentHP !== newStats.currentHP
    ) {
      this._game.emitAction(newStats);
      this.lastNotifiedStats = newStats;
    }
  }

  canAttack(target: AttackTarget): boolean {
    // このターンに召喚されていたら攻撃不可 (速攻は除く)
    const haste = this._game.findEffectByDef(HasteEffect, this.asTarget);
    if (!haste) {
      if (this._game.turn === this.state.summonedTurn) {
        return false;
      }
    }

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

    // 攻撃対象がブロック (またはウォール) されていないかチェック (ねらい撃ちは除く)
    const snipe = this._game.findEffectByDef(SnipeEffect, this.asTarget);
    if (!snipe && this._field.isAttackTargetBlocked(target)) {
      return false;
    }

    return true;
  }

  attack(target: AttackTarget): void {
    switch (target.type) {
      case TargetType.LEADER:
        this._game.emitAction({
          type: GameActionType.ATTACK,
          actor: this.state.owner,
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
          actor: this.state.owner,
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
      throw new GameRuntimeError('GameFieldUnitContext.gainDamage: negative damage ' + damage);
    }

    // 闇の衣中はいかなるダメージも 0 になる
    const actualDamage = this.isDarkClothed() ? 0 : Math.min(damage, this.currentHP);

    this.updateState({
      ...this.state,
      currentHP: this.currentHP - actualDamage,
    });
    this._game.emitAction({
      type: GameActionType.UNIT_GAIN_DAMAGE,
      actor: this.state.owner,
      position: this.position,
      damage: actualDamage,
      timestamp: getCurrentTime(),
    });

    return actualDamage;
  }

  gainHeal(heal: number, _source: DamageSource): number {
    if (heal < 0) {
      throw new GameRuntimeError('GameFieldUnitContext.gainHeal: negative heal ' + heal);
    }

    const maxHP = this.getCalculatedMaxHP();
    const actualHeal = Math.min(heal, maxHP - this.currentHP);

    this.updateState({
      ...this.state,
      currentHP: this.currentHP + actualHeal,
    });
    this._game.emitAction({
      type: GameActionType.UNIT_GAIN_HEAL,
      actor: this.state.owner,
      position: this.position,
      heal: actualHeal,
      timestamp: getCurrentTime(),
    });

    return actualHeal;
  }
}
