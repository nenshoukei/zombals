import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id } from '@/types';

/**
 * ねらい撃ちを得る効果
 */
export class SnipeEffect extends BaseEffectDefinition<null> {
  static readonly id = 18 as Id;

  constructor() {
    super({
      id: SnipeEffect.id,
      targetTypes: [EffectTargetType.LEADER, EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }
}
