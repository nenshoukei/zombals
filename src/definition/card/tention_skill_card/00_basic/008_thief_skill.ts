import { ThievesKnife } from '../../weapon_card/00_basic/002_thieves_knife';
import { cardRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, GameContext } from '@/types';
import { BaseTentionSkillCardDefinition } from '@/types/definition/tention_skill_card';

export class ThiefSkill extends BaseTentionSkillCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.TENTION_SKILL, 8);

  constructor() {
    super({
      id: ThiefSkill.id,
      name: {
        ja: '盗賊のかみわざ',
      },
      description: {
        ja: `「反撃ダメージ-1\nこの武器が壊れた時\nカードを1枚引く」を持つ\n1/2のシーブスナイフを\n装備する`,
      },
      cost: 0,
      job: CardJob.THIEF,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [],
    });
  }

  use(ctx: GameContext): void {
    // シーブスナイフを装備する
    ctx.ally.equipWeaponDef(cardRegistry.getByDef(ThievesKnife));
  }
}
