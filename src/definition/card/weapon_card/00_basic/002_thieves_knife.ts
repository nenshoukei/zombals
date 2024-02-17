import { CardJob, CardPack, CardRarity, CardType } from '@/types';
import { BaseWeaponCardDefinition } from '@/types/definition/weapon_card';

export class ThievesKnife extends BaseWeaponCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.WEAPON, 2);

  constructor() {
    super({
      id: ThievesKnife.id,
      name: {
        ja: 'シーブスナイフ',
      },
      description: {
        ja: '反撃ダメージ-1\n\nこの武器が壊れた時\nカードを1枚引く',
      },
      cost: 2,
      job: CardJob.THIEF,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 1,
      durability: 2,
    });
  }
}
