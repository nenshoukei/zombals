import { GuardianEffect } from '@/definition/effect/016_guardian_effect';
import { effectRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, FieldUnitState, GameContext, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class StoneMan extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 13);

  constructor() {
    super({
      id: StoneMan.id,
      name: {
        ja: 'ストーンマン',
      },
      description: {
        ja: '*におうだち*',
      },
      cost: 5,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 6,
      maxHP: 4,
      kind: UnitKind.NONE,
    });
  }

  onFieldUnitCreated(ctx: GameContext, unit: FieldUnitState): void {
    const unitCtx = ctx.field.getFieldUnitContext(unit);
    unitCtx.addEffectDef(effectRegistry.getByDef(GuardianEffect), null);
  }
}
