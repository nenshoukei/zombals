import { CardJob, CardPack, CardRarity, CardType } from '@/types';
import { BaseWeaponCardDefinition } from '@/types/definition/weapon_card';

export class SteelSword extends BaseWeaponCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.WEAPON, 1);

  constructor() {
    super({
      id: SteelSword.id,
      name: {
        ja: 'はがねのつるぎ',
      },
      description: {
        ja: '',
      },
      cost: 2,
      job: CardJob.WARRIOR,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 2,
      durability: 2,
    });
  }
}
