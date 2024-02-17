import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id } from '@/types';

/**
 * ステルスを得る効果
 */
export class StealthEffect extends BaseEffectDefinition<null> {
  static readonly id = 11 as Id;

  constructor() {
    super({
      id: StealthEffect.id,
      targetTypes: [EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }
}
