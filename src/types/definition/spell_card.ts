import { CardType } from '../common';
import { GameContext } from '../context';
import { LeaderPosition } from '../field';
import { SpellCardState } from '../game_state';
import { SpellCardDefinition } from './base';
import { BaseCardDefinition, BaseCardDefinitionInit } from './card';

export type SpellCardDefinitionInit = BaseCardDefinitionInit & {
  type: typeof CardType.SPELL;
};

/**
 * 特技カード定義
 */
export abstract class BaseSpellCardDefinition
  extends BaseCardDefinition<SpellCardDefinitionInit, SpellCardState>
  implements SpellCardDefinition
{
  constructor(defs: Omit<SpellCardDefinitionInit, 'type'>) {
    super({
      ...defs,
      type: CardType.SPELL,
    });
  }

  createState(ctx: GameContext, owner: LeaderPosition): SpellCardState {
    return {
      type: CardType.SPELL,
      id: ctx.generateStateID(),
      cardDefId: this.id,
      owner,
      cost: 0,
      proficiencyPlus: 0,
    };
  }

  toString(): string {
    return `[SpellCardDefinition #${this.id} ${this.name.ja}]`;
  }
}
