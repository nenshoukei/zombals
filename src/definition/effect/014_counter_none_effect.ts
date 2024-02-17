import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id, LocaleString } from '@/types';

/**
 * 「反撃ダメージを受けない」を得る効果
 */
export class CounterNoneEffect extends BaseEffectDefinition<null> {
  static readonly id = 14 as Id;

  constructor() {
    super({
      id: CounterNoneEffect.id,
      targetTypes: [EffectTargetType.LEADER, EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }

  getCurrentDescription(): LocaleString | null {
    return {
      ja: `反撃ダメージを受けない`,
    };
  }
}
