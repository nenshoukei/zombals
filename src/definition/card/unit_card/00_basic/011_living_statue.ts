import { GuardianEffect } from '@/definition/effect/016_guardian_effect';
import { effectRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, FieldUnitState, GameContext, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class LivingStatue extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 11);

  constructor() {
    super({
      id: LivingStatue.id,
      name: {
        ja: 'リビングスタチュー',
      },
      description: {
        ja: '*におうだち*',
      },
      cost: 4,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 3,
      maxHP: 5,
      kind: UnitKind.NONE,
    });
  }

  onFieldUnitCreated(ctx: GameContext, unit: FieldUnitState): void {
    const unitCtx = ctx.field.getFieldUnitContext(unit);
    unitCtx.addEffectDef(effectRegistry.getByDef(GuardianEffect), null);
  }
}
