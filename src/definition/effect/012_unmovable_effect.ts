import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id, LocaleString } from '@/types';

/**
 * 移動不可を得る効果
 */
export class UnmovableEffect extends BaseEffectDefinition<null> {
  static readonly id = 12 as Id;

  constructor() {
    super({
      id: UnmovableEffect.id,
      targetTypes: [EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }

  getCurrentDescription(): LocaleString | null {
    return {
      ja: '移動不可',
    };
  }
}
