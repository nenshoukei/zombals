import { MartialArtKick } from '../../spell_card/00_basic/001_martial_art_kick';
import { MartialArtPunch } from '../../spell_card/00_basic/002_martial_art_punch';
import { MartialArtConcentrate } from '../../spell_card/00_basic/003_martial_art_concentrate';
import { cardRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, GameContext } from '@/types';
import { BaseTentionSkillCardDefinition } from '@/types/definition/tention_skill_card';

const MARTIAL_ART_DEF_IDS = [MartialArtKick.id, MartialArtPunch.id, MartialArtConcentrate.id];

export class FighterSkill extends BaseTentionSkillCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.TENTION_SKILL, 3);

  constructor() {
    super({
      id: FighterSkill.id,
      name: {
        ja: 'おてんば姫',
      },
      description: {
        ja: `カードを1枚引く\n武術カード1枚を\n手札に加える`,
      },
      cost: 0,
      job: CardJob.FIGHTER,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [],
    });
  }

  use(ctx: GameContext): void {
    // カードを1枚引く
    ctx.ally.drawCard(1);

    // どの武術カードを加えるか乱数で決める
    const rand = ctx.generateRandomInt(0, MARTIAL_ART_DEF_IDS.length - 1);

    const def = cardRegistry.getById(MARTIAL_ART_DEF_IDS[rand]);
    ctx.ally.addCardsToHand([def.createState(ctx, ctx.ally.position)]);
  }
}
