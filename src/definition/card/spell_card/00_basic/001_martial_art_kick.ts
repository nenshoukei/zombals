import { CardJob, CardPack, CardRarity, CardType, GameContext, SpellCardState, Target, TargetType } from '@/types';
import { BaseSpellCardDefinition } from '@/types/definition/spell_card';

export class MartialArtKick extends BaseSpellCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.SPELL, 1);

  constructor() {
    super({
      id: MartialArtKick.id,
      name: {
        ja: '武術：飛びげり',
      },
      description: {
        ja: 'ユニット1体の位置を\n前後入れ替える',
      },
      cost: 0,
      job: CardJob.FIGHTER,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [TargetType.UNIT],
      isToken: true,
    });
  }

  isUsableAt(ctx: GameContext, card: SpellCardState, target: Target): boolean {
    if (!super.isUsableAt(ctx, card, target)) return false;
    if (target.type !== TargetType.UNIT) return false;

    const unit = ctx.field.getUnitById(target.unitId);
    if (!unit || !unit.isMovable()) {
      // 移動不可ユニットに対しては使用不可
      return false;
    }

    return true;
  }

  use(ctx: GameContext, card: SpellCardState, target?: Target | undefined): void {
    if (!target || target.type !== TargetType.UNIT) return;

    const unit = ctx.field.getUnitById(target.unitId);
    if (unit) {
      // 対象ユニットの前後を入れ替える
      ctx.field.swapUnitPositionsOnSideRow(unit.sideRow);
    }
  }
}
