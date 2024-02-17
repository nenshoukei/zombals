import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id, LocaleString } from '@/types';

/**
 * 占いの超必中モードを得る効果
 */
export class FortuneSuperTrueEffect extends BaseEffectDefinition<null> {
  static readonly id = 21 as Id;

  constructor() {
    super({
      id: FortuneSuperTrueEffect.id,
      targetTypes: [EffectTargetType.LEADER],
      isDescriptionMerged: false,
    });
  }

  getCurrentDescription(): LocaleString | null {
    return {
      ja: '占い効果がすべて発動する超必中状態',
    };
  }
}
