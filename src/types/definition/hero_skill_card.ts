import { CardType } from '../common';
import { GameContext } from '../context';
import { LeaderPosition } from '../field';
import { HeroSkillCardState } from '../game_state';
import { HeroSkillCardDefinition } from './base';
import { BaseCardDefinition, BaseCardDefinitionInit } from './card';

export type HeroSkillCardDefinitionInit = BaseCardDefinitionInit & {
  type: typeof CardType.HERO_SKILL;
};

/**
 * ヒーロースキルカード定義
 */
export abstract class BaseHeroSkillCardDefinition
  extends BaseCardDefinition<HeroSkillCardDefinitionInit, HeroSkillCardState>
  implements HeroSkillCardDefinition
{
  constructor(defs: Omit<HeroSkillCardDefinitionInit, 'type' | 'additionalTargetTypes'>) {
    super({
      ...defs,
      type: CardType.HERO_SKILL,
    });
  }

  createState(ctx: GameContext, owner: LeaderPosition): HeroSkillCardState {
    return {
      type: CardType.HERO_SKILL,
      id: ctx.generateStateID(),
      cardDefId: this.id,
      owner,
      cost: this.cost,
      proficiencyPlus: 0,
      isToken: true,
    };
  }

  toString(): string {
    return `[HeroSkillCardDefinition #${this.id} ${this.name.ja}]`;
  }
}
