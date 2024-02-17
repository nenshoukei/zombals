import { CardJob, CardPack, CardRarity, CardType, GameContext } from '@/types';
import { BaseSpellCardDefinition } from '@/types/definition/spell_card';

export class MartialArtConcentrate extends BaseSpellCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.SPELL, 3);

  constructor() {
    super({
      id: MartialArtConcentrate.id,
      name: {
        ja: '武術：精神統一',
      },
      description: {
        ja: 'カードを1枚引く',
      },
      cost: 0,
      job: CardJob.FIGHTER,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [],
      isToken: true,
    });
  }

  use(ctx: GameContext): void {
    // カードを1枚引く
    ctx.ally.drawCard(1);
  }
}
