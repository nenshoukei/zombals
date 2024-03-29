import { HasteEffect } from '@/definition';
import { effectRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, FieldUnitState, GameContext, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class Furrat extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 5);

  constructor() {
    super({
      id: Furrat.id,
      name: {
        ja: 'ファーラット',
      },
      description: {
        ja: '*速攻*',
      },
      cost: 1,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 1,
      maxHP: 1,
      kind: UnitKind.NONE,
    });
  }

  onFieldUnitCreated(ctx: GameContext, unit: FieldUnitState): void {
    const unitCtx = ctx.field.getFieldUnitContext(unit);
    unitCtx.addEffectDef(effectRegistry.getByDef(HasteEffect), null);
  }
}
