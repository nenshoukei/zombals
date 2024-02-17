import { CardJob, CardPack, CardRarity, CardType, GameContext, SpellCardState, Target, TargetType } from '@/types';
import { BaseSpellCardDefinition } from '@/types/definition/spell_card';

export class MerchantItemPower extends BaseSpellCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.SPELL, 4);

  constructor() {
    super({
      id: MerchantItemPower.id,
      name: {
        ja: '道具：ちからのたね',
      },
      description: {
        ja: 'ユニット1体の\n攻撃力+1',
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

    // 永続的な攻撃力増加を付与
    const unit = ctx.field.getUnitById(target.unitId);
    if (unit) {
      unit.changeStats(1, 0, ctx.ally.asEffectSource);
    }
  }
}
