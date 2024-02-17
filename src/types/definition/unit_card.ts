import { CardType } from '../common';
import { GameContext } from '../context';
import { AttackTarget, LeaderPosition, Target, TargetType } from '../field';
import { FieldUnitState, UnitCardState } from '../game_state';
import { UnitCardDefinition } from './base';
import { BaseCardDefinition, BaseCardDefinitionInit } from './card';

export type UnitCardDefinitionInit = BaseCardDefinitionInit &
  Pick<UnitCardDefinition, 'power' | 'maxHP' | 'kind'> & {
    type: typeof CardType.UNIT;
  };

/**
 * ユニットカード定義
 */
export abstract class BaseUnitCardDefinition
  extends BaseCardDefinition<UnitCardDefinitionInit, UnitCardState>
  implements UnitCardDefinition
{
  constructor(defs: Omit<UnitCardDefinitionInit, 'type' | 'targetTypes'>) {
    super({
      ...defs,
      type: CardType.UNIT,
      targetTypes: [TargetType.CELL],
    });
  }

  get power() {
    return this.init.power;
  }

  get maxHP() {
    return this.init.maxHP;
  }

  get kind() {
    return this.init.kind;
  }

  createState(ctx: GameContext, owner: LeaderPosition): UnitCardState {
    return {
      type: CardType.UNIT,
      id: ctx.generateStateID(),
      cardDefId: this.id,
      owner,
      cost: this.cost,
      power: this.power,
      maxHP: this.maxHP,
      proficiencyPlus: 0,
    };
  }

  isUsable(ctx: GameContext, card: UnitCardState): boolean {
    if (!super.isUsable(ctx, card)) return false;

    if (ctx.field.isFullObjectForLeader(ctx.ally.position)) {
      // フィールドに空きがなければ使用不可
      return false;
    }

    return true;
  }

  isUsableAt(ctx: GameContext, card: UnitCardState, target: Target): boolean {
    if (!super.isUsableAt(ctx, card, target)) return false;

    if (target.type === TargetType.CELL) {
      // 自分のマスのみ
      if (!ctx.field.isCellOwnedBy(target.position, ctx.ally.position)) {
        return false;
      }

      // 指定マスが空いてなければ使用不可
      if (ctx.field.getObjectAt(target.position)) {
        return false;
      }
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  use(ctx: GameContext, card: UnitCardState, target?: Target, additionalTarget?: Target): void {
    if (target?.type === TargetType.CELL) {
      // 指定マスにユニットカードをプレイ
      ctx.field.putUnitCardAt(card, target.position);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFieldUnitCreated(ctx: GameContext, unit: FieldUnitState): void {
    // デフォルトは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFieldUnitDestoyed(ctx: GameContext, unit: FieldUnitState): void {
    // デフォルトは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFieldUnitExiled(ctx: GameContext, unit: FieldUnitState): void {
    // デフォルトは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFieldUnitAttacking(ctx: GameContext, unit: FieldUnitState, target: AttackTarget): void {
    // デフォルトは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFieldUnitAttacked(ctx: GameContext, unit: FieldUnitState, target: AttackTarget): void {
    // デフォルトは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFieldUnitMoved(ctx: GameContext, unit: FieldUnitState): void {
    // デフォルトは何もしない
  }

  toString(): string {
    return `[UnitCardDefinition #${this.id} ${this.name.ja}]`;
  }
}
