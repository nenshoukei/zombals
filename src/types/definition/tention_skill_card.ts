import { CardType } from '../common';
import { GameContext } from '../context';
import { LeaderPosition } from '../field';
import { TentionSkillCardState } from '../game_state';
import { TentionSkillCardDefinition } from './base';
import { BaseCardDefinition, BaseCardDefinitionInit } from './card';
import { MAX_TENTION } from '@/config/common';

export type TentionSkillCardDefinitionInit = BaseCardDefinitionInit & {
  type: typeof CardType.TENTION_SKILL;
};

/**
 * テンションスキルカード定義
 */
export abstract class BaseTentionSkillCardDefinition
  extends BaseCardDefinition<TentionSkillCardDefinitionInit, TentionSkillCardState>
  implements TentionSkillCardDefinition
{
  constructor(defs: Omit<TentionSkillCardDefinitionInit, 'type' | 'isToken' | 'additionalTargetTypes'>) {
    super({
      ...defs,
      type: CardType.TENTION_SKILL,
      isToken: true,
    });
  }

  /**
   * TentionSkillCardState を生成する。
   *
   * @param ctx コンテキスト
   * @param owner オーナーのプレイヤー位置
   * @returns 作成された TentionSkillCardState
   */
  createState(ctx: GameContext, owner: LeaderPosition): TentionSkillCardState {
    return {
      type: CardType.TENTION_SKILL,
      id: ctx.generateStateID(),
      cardDefId: this.id,
      owner,
      cost: this.cost,
      proficiencyPlus: 0,
      isToken: true,
    };
  }

  isUsable(ctx: GameContext, card: TentionSkillCardState): boolean {
    if (!super.isUsable(ctx, card)) return false;

    // テンションが最大でないと使用不可
    if (ctx.ally.state.tentionCount < MAX_TENTION) {
      return false;
    }

    return true;
  }

  toString(): string {
    return `[TentionSkillCardDefinition #${this.id} ${this.name.ja}]`;
  }
}
