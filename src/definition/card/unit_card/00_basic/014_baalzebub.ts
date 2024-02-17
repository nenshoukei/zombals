import { CardJob, CardPack, CardRarity, CardType, DamageSourceType, GameContext, TargetCell, UnitCardState, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class Baalzebub extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 14);

  constructor() {
    super({
      id: Baalzebub.id,
      name: {
        ja: 'バアルゼブブ',
      },
      description: {
        ja: '*召喚時*:\n敵リーダーに\n3ダメージ',
      },
      cost: 5,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 5,
      maxHP: 3,
      kind: UnitKind.NONE,
    });
  }

  onUse(ctx: GameContext, card: UnitCardState, target: TargetCell): void {
    const opponent = ctx.getOpponent(card.owner);
    opponent.gainDamage(3, {
      type: DamageSourceType.UNIT,
      position: target.position,
    });
  }
}
