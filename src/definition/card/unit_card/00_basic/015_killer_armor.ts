import { CardJob, CardPack, CardRarity, CardType, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class KillerArmor extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 15);

  constructor() {
    super({
      id: KillerArmor.id,
      name: {
        ja: 'キラーアーマー',
      },
      description: {
        ja: '',
      },
      cost: 6,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 6,
      maxHP: 7,
      kind: UnitKind.NONE,
    });
  }
}
