import { CardJob, CardPack, CardRarity, CardType, DamageSourceType, GameContext, SpellCardState, Target, TargetType } from '@/types';
import { BaseSpellCardDefinition } from '@/types/definition/spell_card';

export class MartialArtPunch extends BaseSpellCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.SPELL, 2);

  constructor() {
    super({
      id: MartialArtPunch.id,
      name: {
        ja: '武術：ストレートパンチ',
      },
      description: {
        ja: '1ダメージを与える',
      },
      cost: 0,
      job: CardJob.FIGHTER,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [TargetType.LEADER, TargetType.UNIT],
      isToken: true,
    });
  }

  use(ctx: GameContext, card: SpellCardState, target?: Target | undefined): void {
    if (!target || (target.type !== TargetType.LEADER && target.type !== TargetType.UNIT)) return;

    const attackTarget = ctx.field.getAttackTargetByTarget(target);
    if (attackTarget) {
      attackTarget.gainDamage(1, {
        type: DamageSourceType.SPELL,
        cardId: card.id,
        position: ctx.ally.position,
      });
    }
  }
}
