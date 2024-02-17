import { CardJob, CardPack, CardRarity, CardType, GameContext, UnitCardState, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class RottenBody extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 9);

  constructor() {
    super({
      id: RottenBody.id,
      name: {
        ja: 'くさった死体',
      },
      description: {
        ja: '*召喚時*:\n敵リーダーの\n武器を破壊する',
      },
      cost: 3,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 3,
      maxHP: 3,
      kind: UnitKind.ZOMBIE,
    });
  }

  onUse(ctx: GameContext, card: UnitCardState): void {
    const opponent = ctx.getOpponent(card.owner);
    if (opponent.weapon) {
      opponent.breakWeapon();
    }
  }
}
