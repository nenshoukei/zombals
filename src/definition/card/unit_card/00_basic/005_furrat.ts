import { GuardianEffect } from '@/definition/effect/016_guardian_effect';
import { effectRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, EffectSourceType, FieldUnitState, GameContext, UnitKind } from '@/types';
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
      kind: UnitKind.SLIME,
    });
  }

  onFieldUnitCreated(ctx: GameContext, unit: FieldUnitState): void {
    const def = effectRegistry.getByDef(GuardianEffect);
    ctx.addEffect(
      def.createState({
        ctx,
        owner: unit.owner,
        source: {
          type: EffectSourceType.UNIT,
          unitId: unit.id,
        },
        target: {
          type: EffectSourceType.UNIT,
          unitId: unit.id,
        },
        initialStorage: null,
      }),
    );
  }
}
