import { GuardianEffect } from '@/definition/effect/016_guardian_effect';
import { effectRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, FieldUnitState, GameContext, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class SlimeTsumuri extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 4);

  constructor() {
    super({
      id: SlimeTsumuri.id,
      name: {
        ja: 'スライムつむり',
      },
      description: {
        ja: '*におうだち*',
      },
      cost: 1,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 1,
      maxHP: 2,
      kind: UnitKind.SLIME,
    });
  }

  onFieldUnitCreated(ctx: GameContext, unit: FieldUnitState): void {
    const unitCtx = ctx.field.getFieldUnitContext(unit);
    unitCtx.addEffectDef(effectRegistry.getByDef(GuardianEffect), null);
  }
}
