import { CardJob, CardPack, CardRarity, CardType, GameContext, SpellCardState, Target, TargetType } from '@/types';
import { BaseSpellCardDefinition } from '@/types/definition/spell_card';

export class MerchantItemBoth extends BaseSpellCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.SPELL, 6);

  constructor() {
    super({
      id: MerchantItemBoth.id,
      name: {
        ja: '道具：しあわせのたね',
      },
      description: {
        ja: 'ユニット1体の\n+1/+1',
      },
      cost: 1,
      job: CardJob.MERCHANT,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [TargetType.UNIT],
      isToken: true,
    });
  }

  use(ctx: GameContext, card: SpellCardState, target?: Target | undefined): void {
    if (!target || target.type !== TargetType.UNIT) return;

    // 永続的な+1/+1を付与
    const unit = ctx.field.getUnitById(target.unitId);
    if (unit) {
      unit.changeStats(1, 1, ctx.ally.asEffectSource);
    }
  }
}
