import { CardJob, CardPack, CardRarity, CardType, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class Slime extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 1);

  constructor() {
    super({
      id: Slime.id,
      name: {
        ja: 'スライム',
      },
      description: {
        ja: '',
      },
      cost: 0,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 1,
      maxHP: 1,
      kind: UnitKind.SLIME,
    });
  }
}
