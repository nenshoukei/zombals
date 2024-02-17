import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id } from '@/types';

/**
 * 貫通を得る効果
 */
export class PenetrateEffect extends BaseEffectDefinition<null> {
  static readonly id = 10 as Id;

  constructor() {
    super({
      id: PenetrateEffect.id,
      targetTypes: [EffectTargetType.LEADER, EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }
}
