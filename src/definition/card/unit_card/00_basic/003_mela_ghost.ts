import {
  CardJob,
  CardPack,
  CardRarity,
  CardType,
  DamageSourceType,
  GameContext,
  Target,
  TargetType,
  UnitCardState,
  UnitKind,
} from '@/types';
import { BaseUnitCardDefinition } from '@/types/definition/unit_card';

export class MelaGhost extends BaseUnitCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.UNIT, 3);

  constructor() {
    super({
      id: MelaGhost.id,
      name: {
        ja: 'メラゴースト',
      },
      description: {
        ja: '*召喚時*:\n1ダメージを与える',
      },
      cost: 1,
      job: CardJob.COMMON,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      power: 1,
      maxHP: 1,
      kind: UnitKind.NONE,
      additionalTargetTypes: [TargetType.LEADER, TargetType.UNIT],
    });
  }

  use(ctx: GameContext, card: UnitCardState, target?: Target, additionalTarget?: Target): void {
    super.use(ctx, card, target, additionalTarget);
    if (target?.type !== TargetType.CELL) return;

    if (additionalTarget && (additionalTarget.type === TargetType.UNIT || additionalTarget.type === TargetType.LEADER)) {
      ctx.field.getAttackTargetByTarget(additionalTarget)?.gainDamage(1, {
        type: DamageSourceType.UNIT,
        position: target.position,
      });
    }
  }
}
