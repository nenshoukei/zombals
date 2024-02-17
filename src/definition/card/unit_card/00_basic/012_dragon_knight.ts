import { CardJob, CardPack, CardRarity, CardType, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class DragonKnight extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 12);

  constructor() {
    super({
      id: DragonKnight.id,
      name: {
        ja: 'りゅうき兵',
      },
      description: {
        ja: '',
      },
      cost: 4,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 4,
      maxHP: 5,
      kind: UnitKind.DRAGON,
    });
  }
}
