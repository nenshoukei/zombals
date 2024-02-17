import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id, LocaleString } from '@/types';

/**
 * 2回攻撃を得る効果
 */
export class DoubleAttackEffect extends BaseEffectDefinition<null> {
  static readonly id = 15 as Id;

  constructor() {
    super({
      id: DoubleAttackEffect.id,
      targetTypes: [EffectTargetType.LEADER, EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }

  getCurrentDescription(): LocaleString | null {
    return {
      ja: '2',
    };
  }
}
