import { CardJob, CardPack, CardRarity, CardType, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class BirdFighter extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 10);

  constructor() {
    super({
      id: BirdFighter.id,
      name: {
        ja: 'バードファイター',
      },
      description: {
        ja: '',
      },
      cost: 3,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 4,
      maxHP: 3,
      kind: UnitKind.NONE,
    });
  }
}
