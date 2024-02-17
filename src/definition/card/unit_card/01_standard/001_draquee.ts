import { CardJob, CardPack, CardRarity, CardType, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class Draquee extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.STANDARD, CardType.UNIT, 1);

  constructor() {
    super({
      id: Draquee.id,
      name: {
        ja: 'ドラキー',
      },
      description: {
        ja: '*ねらい撃ち*',
      },
      cost: 1,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.STANDARD,
      power: 2,
      maxHP: 1,
      kind: UnitKind.NONE,
    });
  }
}
