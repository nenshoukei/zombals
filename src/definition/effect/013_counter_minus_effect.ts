import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectState, EffectTargetType, GameContext, Id, LocaleString } from '@/types';

export type CounterMinusEffectStorage = {
  minusDamage: number;
};

/**
 * 反撃ダメージ-n を得る効果
 */
export class CounterMinusEffect extends BaseEffectDefinition<CounterMinusEffectStorage> {
  static readonly id = 13 as Id;

  constructor() {
    super({
      id: CounterMinusEffect.id,
      targetTypes: [EffectTargetType.LEADER, EffectTargetType.UNIT],
      isDescriptionMerged: true,
    });
  }

  getMergedDescription(ctx: GameContext, effects: EffectState<CounterMinusEffectStorage>[]): LocaleString | null {
    let totalMinusDamage = 0;
    for (const effect of effects) {
      totalMinusDamage += effect.storage.minusDamage;
    }
    return {
      ja: `反撃ダメージ -${totalMinusDamage}`,
    };
  }
}
