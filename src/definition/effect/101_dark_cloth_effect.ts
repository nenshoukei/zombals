import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id, LocaleString } from '@/types';

/**
 * 「闇の衣」効果（ダメージや効果を全て無効化する）
 */
export class DarkClothEffect extends BaseEffectDefinition<null> {
  static readonly id = 101 as Id;

  constructor() {
    super({
      id: DarkClothEffect.id,
      targetTypes: [EffectTargetType.UNIT],
      isDescriptionMerged: true,
    });
  }

  getMergedDescription(): LocaleString | null {
    return {
      ja: `闇の衣：ダメージや全ての効果を受けない`,
    };
  }
}
