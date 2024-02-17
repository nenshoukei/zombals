import { CardJob, CardPack, CardRarity, CardType, DamageSourceType, GameContext, Target, TargetType, TentionSkillCardState } from '@/types';
import { BaseTentionSkillCardDefinition } from '@/types/definition/tention_skill_card';

const DAMAGE = 3;

export class WizardSkill extends BaseTentionSkillCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.TENTION_SKILL, 2);

  constructor() {
    super({
      id: WizardSkill.id,
      name: {
        ja: '紅蓮の火球',
      },
      description: {
        ja: `敵 1 体に\n${DAMAGE} ダメージを与える`,
      },
      cost: 0,
      job: CardJob.WIZARD,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [TargetType.LEADER, TargetType.UNIT],
    });
  }

  isUsableAt(ctx: GameContext, card: TentionSkillCardState, target: Target): boolean {
    if (!super.isUsableAt(ctx, card, target)) return false;

    if (target.type === TargetType.LEADER && target.position === ctx.ally.position) {
      // 自分自身に対しての使用は不可
      return false;
    }

    return true;
  }

  use(ctx: GameContext): void {
    // ダメージを与える
    ctx.enemy.gainDamage(DAMAGE, {
      type: DamageSourceType.TENTION_SKILL,
      position: ctx.ally.position,
    });
  }
}
