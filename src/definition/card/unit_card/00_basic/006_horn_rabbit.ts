import { HasteEffect } from '@/definition';
import { effectRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, FieldUnitState, GameContext, UnitKind } from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class HornRabbit extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 6);

  constructor() {
    super({
      id: HornRabbit.id,
      name: {
        ja: 'いっかくうさぎ',
      },
      description: {
        ja: '*速攻*',
      },
      cost: 2,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 2,
      maxHP: 1,
      kind: UnitKind.NONE,
    });
  }

  onFieldUnitCreated(ctx: GameContext, unit: FieldUnitState): void {
    const unitCtx = ctx.field.getFieldUnitContext(unit);
    unitCtx.addEffectDef(effectRegistry.getByDef(HasteEffect), null);
  }
}
