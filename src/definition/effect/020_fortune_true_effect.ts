import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id, LocaleString } from '@/types';

/**
 * 占いの必中モードを得る効果
 */
export class FortuneTrueEffect extends BaseEffectDefinition<null> {
  static readonly id = 20 as Id;

  constructor() {
    super({
      id: FortuneTrueEffect.id,
      targetTypes: [EffectTargetType.LEADER],
      isDescriptionMerged: false,
    });
  }

  getCurrentDescription(): LocaleString | null {
    return {
      ja: '占い効果が選択できる必中状態',
    };
  }
}
