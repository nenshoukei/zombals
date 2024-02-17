import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectState, EffectTargetType, GameContext, Id, LocaleString } from '@/types';

export type MerchantSkillBuffEffectStorage = {
  plusCount: number;
};

/**
 * この対戦中「お宝発見」で手に入る道具カードの数を増やす永続効果
 */
export class MerchantSkillBuffEffect extends BaseEffectDefinition<MerchantSkillBuffEffectStorage> {
  static readonly id = 100 as Id;

  constructor() {
    super({
      id: MerchantSkillBuffEffect.id,
      targetTypes: [EffectTargetType.LEADER],
      isDescriptionMerged: true,
    });
  }

  getMergedDescription(ctx: GameContext, effects: EffectState<MerchantSkillBuffEffectStorage>[]): LocaleString | null {
    let totalPlusCount = 0;
    effects.forEach((effect) => (totalPlusCount += effect.storage.plusCount));
    return {
      ja: `「お宝発見」で手に入る道具カードの数 +${totalPlusCount} 枚`,
    };
  }
}
