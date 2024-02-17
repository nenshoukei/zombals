import { CardJob, CardPack, CardRarity, CardType, DamageSourceType, GameContext, SpellCardState, Target, TargetType } from '@/types';
import { BaseSpellCardDefinition } from '@/types/definition/spell_card';

export class FortuneJudgementTarot extends BaseSpellCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.SPELL, 7);

  constructor() {
    super({
      id: FortuneJudgementTarot.id,
      name: {
        ja: '審判のタロット',
      },
      description: {
        ja: '*占い*:\n①カードを1枚引く\n②味方リーダーの\nHPを2回復',
      },
      cost: 0,
      job: CardJob.FORTUNE,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [],
      isToken: true,
    });
  }

  use(ctx: GameContext, card: SpellCardState, target?: Target | undefined): void {
    if (!target || target.type !== TargetType.UNIT) return;

    // 占い効果処理
    ctx.fortune(card, [
      {
        cardDefId: FortuneJudgementTarot.id,
        description: {
          ja: '①カードを1枚引く',
        },
      },
      {
        cardDefId: FortuneJudgementTarot.id,
        description: {
          ja: '②味方リーダーの\nHPを2回復',
        },
      },
    ]);
  }

  onOptionSelected(ctx: GameContext, card: SpellCardState, selectIndex: number): void {
    // 占い選択された
    if (selectIndex === 0) {
      ctx.ally.drawCard(1);
    } else {
      ctx.ally.gainHeal(2, {
        type: DamageSourceType.SPELL,
        cardId: card.id,
        position: card.owner,
      });
    }
  }
}
