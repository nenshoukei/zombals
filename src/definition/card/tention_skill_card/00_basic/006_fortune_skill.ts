import { FortuneJudgementTarot } from '../../spell_card/00_basic/007_fortune_judgement_tarot';
import { cardRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, GameContext, TentionSkillCardState } from '@/types';
import { BaseTentionSkillCardDefinition } from '@/types/definition/tention_skill_card';

export class FortuneSkill extends BaseTentionSkillCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.TENTION_SKILL, 6);

  constructor() {
    super({
      id: FortuneSkill.id,
      name: {
        ja: '水晶占い',
      },
      description: {
        ja: `自分のデッキから\n特技カードを1枚引く\nそのカードの\nコストを-1`,
      },
      cost: 0,
      job: CardJob.FORTUNE,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [],
    });
  }

  use(ctx: GameContext, card: TentionSkillCardState): void {
    // 自分のデッキから特技カードをすべて検索
    const allSpellCards = ctx.ally.state.library.filter((card) => card.type === CardType.SPELL);

    if (allSpellCards.length === 0) {
      // 該当がない場合は審判のタロットを作成する
      const def = cardRegistry.getByDef(FortuneJudgementTarot);
      ctx.ally.addCardsToHand([def.createState(ctx, card.owner)]);
    } else {
      // 該当がある場合はランダムに選択してコスト-1して手札に加える
      const rand = ctx.generateRandomInt(0, allSpellCards.length - 1);
      const card = allSpellCards[rand];
      ctx.getCardContext(card).changeCost(-1);
      ctx.ally.addCardsToHand([card]);
    }
  }
}
