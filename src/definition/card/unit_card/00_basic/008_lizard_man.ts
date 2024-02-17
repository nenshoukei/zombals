import { CardJob, CardPack, CardRarity, CardType, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class LizardMan extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 8);

  constructor() {
    super({
      id: LizardMan.id,
      name: {
        ja: 'リザードマン',
      },
      description: {
        ja: '',
      },
      cost: 2,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 3,
      maxHP: 2,
      kind: UnitKind.DRAGON,
    });
  }
}
