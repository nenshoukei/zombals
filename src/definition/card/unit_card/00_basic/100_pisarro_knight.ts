import { CardJob, CardPack, CardRarity, CardType, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class PisarroKnight extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 100);

  constructor() {
    super({
      id: PisarroKnight.id,
      name: {
        ja: 'ピサロナイト',
      },
      description: {
        ja: '',
      },
      cost: 2,
      job: CardJob.EVIL,
      rarity: CardRarity.RARE,
      pack: CardPack.BASIC,
      power: 3,
      maxHP: 2,
      kind: UnitKind.NONE,
      isToken: true,
    });
  }
}
