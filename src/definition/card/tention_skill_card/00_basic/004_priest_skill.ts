import { CardJob, CardPack, CardRarity, CardType, DamageSourceTentionSkill, DamageSourceType, GameContext } from '@/types';
import { BaseTentionSkillCardDefinition } from '@/types/definition/tention_skill_card';

const HEAL = 3;

export class PriestSkill extends BaseTentionSkillCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.TENTION_SKILL, 4);

  constructor() {
    super({
      id: PriestSkill.id,
      name: {
        ja: 'いやしの波動',
      },
      description: {
        ja: `味方全体の\nHPを ${HEAL} 回復する`,
      },
      cost: 0,
      job: CardJob.PRIEST,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [],
    });
  }

  use(ctx: GameContext): void {
    const source: DamageSourceTentionSkill = {
      type: DamageSourceType.TENTION_SKILL,
      position: ctx.ally.position,
    };

    // 味方のリーダーとユニットすべてを回復
    for (const target of ctx.field.getAllAttackTargetsOfLeader(ctx.ally.position)) {
      target.gainHeal(HEAL, source);
    }
  }
}
