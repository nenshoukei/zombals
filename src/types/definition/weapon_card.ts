import { CardType } from '../common';
import { GameContext } from '../context';
import { LeaderPosition, Target } from '../field';
import { WeaponCardState } from '../game_state';
import { WeaponCardDefinition } from './base';
import { BaseCardDefinition, BaseCardDefinitionInit } from './card';

export type WeaponCardDefinitionInit = BaseCardDefinitionInit &
  Pick<WeaponCardDefinition, 'power' | 'durability'> & {
    type: typeof CardType.WEAPON;
  };

/**
 * 武器カード定義
 */
export abstract class BaseWeaponCardDefinition
  extends BaseCardDefinition<WeaponCardDefinitionInit, WeaponCardState>
  implements WeaponCardDefinition
{
  constructor(defs: Omit<WeaponCardDefinitionInit, 'type' | 'targetTypes'>) {
    super({
      ...defs,
      type: CardType.WEAPON,
      targetTypes: [],
    });
  }

  get power() {
    return this.init.power;
  }

  get durability() {
    return this.init.durability;
  }

  createState(ctx: GameContext, owner: LeaderPosition): WeaponCardState {
    return {
      type: CardType.WEAPON,
      id: ctx.generateStateID(),
      cardDefId: this.id,
      owner,
      cost: this.cost,
      power: this.power,
      durability: this.durability,
      proficiencyPlus: 0,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  use(ctx: GameContext, card: WeaponCardState, target?: Target, additionalTarget?: Target): void {
    // 武器を装備する
    ctx.ally.equipWeaponCard(card);
  }

  toString(): string {
    return `[WeaponCardDefinition #${this.id} ${this.name.ja}]`;
  }
}
