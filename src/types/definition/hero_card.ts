import { CardType } from '../common';
import { GameContext } from '../context';
import { LeaderPosition } from '../field';
import { HeroCardState } from '../game_state';
import { HeroCardDefinition } from './base';
import { BaseCardDefinition, BaseCardDefinitionInit } from './card';

export type HeroCardDefinitionInit = BaseCardDefinitionInit &
  Pick<HeroCardDefinition, 'isAntiHero'> & {
    type: typeof CardType.HERO;
  };

/**
 * ヒーローカード定義
 */
export abstract class BaseHeroCardDefinition
  extends BaseCardDefinition<HeroCardDefinitionInit, HeroCardState>
  implements HeroCardDefinition
{
  constructor(defs: Omit<HeroCardDefinitionInit, 'type' | 'targetTypes' | 'additionalTargetTypes'>) {
    super({
      ...defs,
      type: CardType.HERO,
      targetTypes: [],
    });
  }

  get isAntiHero() {
    return this.init.isAntiHero;
  }

  createState(ctx: GameContext, owner: LeaderPosition): HeroCardState {
    return {
      type: CardType.HERO,
      id: ctx.generateStateID(),
      cardDefId: this.id,
      owner,
      cost: this.cost,
      proficiencyPlus: 0,
    };
  }

  toString(): string {
    return `[HeroCardDefinition #${this.id} ${this.name.ja}]`;
  }
}
