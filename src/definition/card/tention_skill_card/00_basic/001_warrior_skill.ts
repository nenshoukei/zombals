import { PowerChangeEffect } from '../../../effect/001_power_change_effect';
import { PenetrateEffect } from '../../../effect/010_penetrate_effect';
import { effectRegistry } from '@/registry';
import { CardJob, CardPack, CardRarity, CardType, EffectEndTimingType, GameContext } from '@/types';
import { BaseTentionSkillCardDefinition } from '@/types/definition/tention_skill_card';

const POWER_DELTA = 3;

export class WarriorSkill extends BaseTentionSkillCardDefinition {
  static readonly id = this.generateId(CardPack.BASIC, CardType.TENTION_SKILL, 1);

  constructor() {
    super({
      id: WarriorSkill.id,
      name: {
        ja: '稲妻の加護',
      },
      description: {
        ja: `このターン中\n味方リーダーは\n攻撃力 +${POWER_DELTA} と\n*貫通*を得る`,
      },
      cost: 0,
      job: CardJob.WARRIOR,
      rarity: CardRarity.NORMAL,
      pack: CardPack.BASIC,
      targetTypes: [],
    });
  }

  use(ctx: GameContext): void {
    const powerBuffEffectDef = effectRegistry.getByDef(PowerChangeEffect);
    const penetrateEffectDef = effectRegistry.getByDef(PenetrateEffect);

    // ターン終了時までの攻撃力増加を付与
    ctx.addEffect(
      powerBuffEffectDef.createState({
        ctx,
        target: ctx.ally.asTarget,
        source: ctx.ally.asEffectSource,
        owner: ctx.ally.position,
        endTiming: {
          type: EffectEndTimingType.AT_TURN_END,
          leader: ctx.ally.position,
        },
        initialStorage: {
          delta: POWER_DELTA,
        },
      }),
    );
    // ターン終了時までの貫通効果を付与
    ctx.addEffect(
      penetrateEffectDef.createState({
        ctx,
        target: ctx.ally.asTarget,
        source: ctx.ally.asEffectSource,
        owner: ctx.ally.position,
        endTiming: {
          type: EffectEndTimingType.AT_TURN_END,
          leader: ctx.ally.position,
        },
        initialStorage: null,
      }),
    );
  }
}
