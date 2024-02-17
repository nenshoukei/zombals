import { PisarroKnight } from '../../unit_card/00_basic/100_pisarro_knight';
import { cardRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, GameContext, TentionSkillCardState } from '@/types';
import { BaseTentionSkillCardDefinition } from '@/types/definition/tention_skill_card';

export class EvilSkill extends BaseTentionSkillCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.TENTION_SKILL, 7);

  constructor() {
    super({
      id: EvilSkill.id,
      name: {
        ja: '魔族の騎士',
      },
      description: {
        ja: `3/2の\nピサロナイトを出す`,
      },
      cost: 0,
      job: CardJob.EVIL,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [],
    });
  }

  isUsable(ctx: GameContext, card: TentionSkillCardState): boolean {
    if (!super.isUsable(ctx, card)) return false;

    // フィールドに空きがない場合は使用不可
    return !ctx.field.isFullObjectForLeader(ctx.ally.position);
  }

  use(ctx: GameContext): void {
    // ピサロナイトを場にだす
    ctx.field.putUnitDefForLeader(cardRegistry.getByDef(PisarroKnight), ctx.ally.position);
  }
}
