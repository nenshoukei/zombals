import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id } from '@/types';

/**
 * におうだちを得る効果
 */
export class GuardianEffect extends BaseEffectDefinition<null> {
  static readonly id = 16 as Id;

  constructor() {
    super({
      id: GuardianEffect.id,
      targetTypes: [EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }
}
