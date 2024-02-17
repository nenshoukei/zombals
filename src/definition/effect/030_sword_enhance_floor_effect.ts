import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectTargetType, Id, LocaleString } from '@/types';

/**
 * 刃の紋章の地形効果
 */
export class SwordEnhanceFloorEffect extends BaseEffectDefinition<null> {
  static readonly id = 30 as Id;

  constructor() {
    super({
      id: SwordEnhanceFloorEffect.id,
      targetTypes: [EffectTargetType.FLOOR],
      isDescriptionMerged: false,
    });
  }

  getCurrentDescription(): LocaleString | null {
    return {
      ja: 'このマスにいるユニットは、武器ダメージ+1を得る',
    };
  }
}
