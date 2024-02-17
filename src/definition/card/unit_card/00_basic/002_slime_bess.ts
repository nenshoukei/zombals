import { CardJob, CardPack, CardRarity, CardType, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class SlimeBess extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 2);

  constructor() {
    super({
      id: SlimeBess.id,
      name: {
        ja: 'スライムベス',
      },
      description: {
        ja: '',
      },
      cost: 1,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 2,
      maxHP: 1,
      kind: UnitKind.SLIME,
    });
  }
}
