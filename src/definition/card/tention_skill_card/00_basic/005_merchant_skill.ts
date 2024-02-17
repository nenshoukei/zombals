import { MerchantSkillBuffEffect } from '../../../effect/100_merchant_skill_buff_effect';
import { MerchantItemPower } from '../../spell_card/00_basic/004_merchant_item_power';
import { MerchantItemMaxHP } from '../../spell_card/00_basic/005_merchant_item_maxhp';
import { MerchantItemBoth } from '../../spell_card/00_basic/006_merchant_item_both';
import { cardRegistry, effectRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardState, CardType, GameContext, LocaleString, TentionSkillCardState } from '@/types';
import { BaseTentionSkillCardDefinition } from '@/types/definition/tention_skill_card';
import { templateLocaleString } from '@/utils/string_utils';

const DEFAULT_ITEM_COUNT = 3;

const MERCHANT_ITEM_DEF_IDS = [MerchantItemPower.id, MerchantItemMaxHP.id, MerchantItemBoth.id];

const template = templateLocaleString<{ count: number }>({
  ja: '道具カード %count% 枚を\n手札に加える',
});

export class MerchantSkill extends BaseTentionSkillCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.TENTION_SKILL, 5);

  constructor() {
    super({
      id: MerchantSkill.id,
      name: {
        ja: 'お宝発見',
      },
      description: template({ count: DEFAULT_ITEM_COUNT }),
      cost: 0,
      job: CardJob.PRIEST,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [],
    });
  }

  private getItemCount(ctx: GameContext, card: TentionSkillCardState): number {
    // ネネの効果で道具カード数が加算されている事がある
    const buffDef = effectRegistry.getByDef(MerchantSkillBuffEffect);
    const buff = ctx.findEffectByDef(buffDef, ctx.getPlayer(card.owner).asTarget);
    return buff ? DEFAULT_ITEM_COUNT + buff.storage.plusCount : DEFAULT_ITEM_COUNT;
  }

  getCurrentDescription(ctx: GameContext, card: TentionSkillCardState): LocaleString {
    return template({ count: this.getItemCount(ctx, card) });
  }

  use(ctx: GameContext, card: TentionSkillCardState): void {
    // 道具カードを枚数分取得
    const count = this.getItemCount(ctx, card);

    const cards: CardState[] = [];
    for (let i = 0; i < count; i++) {
      // どの道具カードを加えるか乱数で決める
      const rand = ctx.generateRandomInt(0, MERCHANT_ITEM_DEF_IDS.length - 1);
      const def = cardRegistry.getById(MERCHANT_ITEM_DEF_IDS[rand]);
      cards.push(def.createState(ctx, card.owner));
    }

    // 道具カードを手札に加える
    // 少年ヤンガスの効果 (道具カード置き換え) は手札に加える処理の中で行われる
    ctx.ally.addCardsToHand(cards);
  }
}
