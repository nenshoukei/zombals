import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id } from '@/types';

/**
 * 速攻を得る効果
 */
export class HasteEffect extends BaseEffectDefinition<null> {
  static readonly id = 17 as Id;

  constructor() {
    super({
      id: HasteEffect.id,
      targetTypes: [EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }
}
