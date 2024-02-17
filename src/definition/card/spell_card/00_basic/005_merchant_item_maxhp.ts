import { CardJob, CardPack, CardRarity, CardType, GameContext, SpellCardState, Target, TargetType } from '@/types';
import { BaseSpellCardDefinition } from '@/types/definition/spell_card';

export class MerchantItemMaxHP extends BaseSpellCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.SPELL, 5);

  constructor() {
    super({
      id: MerchantItemMaxHP.id,
      name: {
        ja: '道具：いのちのきのみ',
      },
      description: {
        ja: 'ユニット1体の\nHP+1',
      },
      cost: 0,
      job: CardJob.MERCHANT,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [TargetType.UNIT],
      isToken: true,
    });
  }

  use(ctx: GameContext, card: SpellCardState, target?: Target | undefined): void {
    if (!target || target.type !== TargetType.UNIT) return;

    // 永続的な最大HP増加を付与
    const unit = ctx.field.getUnitById(target.unitId);
    if (unit) {
      unit.changeStats(0, 1, ctx.ally.asEffectSource);
    }
  }
}
