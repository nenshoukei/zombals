import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectState, EffectTargetType, GameContext, Id, TargetType } from '@/types';

export type PowerChangeEffectStorage = {
  /** 攻撃力の変化量 (マイナスの場合は減らす) */
  delta: number;
};

/**
 * ユニットまたはリーダーの攻撃力を増減させる効果
 */
export class PowerChangeEffect extends BaseEffectDefinition<PowerChangeEffectStorage> {
  static readonly id = 1 as Id;

  constructor() {
    super({
      id: PowerChangeEffect.id,
      targetTypes: [EffectTargetType.LEADER, EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }

  onAdded(ctx: GameContext, effect: EffectState<PowerChangeEffectStorage>): void {
    const { delta } = effect.storage;
    if (delta === 0) return;

    if (effect.target?.type === TargetType.LEADER) {
      // 攻撃力が変化するので通知
      ctx.getPlayer(effect.owner).statsChanged();
    } else if (effect.target?.type === TargetType.UNIT) {
      const unit = ctx.field.getUnitById(effect.target.unitId);
      unit?.statsChanged();
    }
  }

  onRemoved(ctx: GameContext, effect: EffectState<PowerChangeEffectStorage>): void {
    const { delta } = effect.storage;
    if (delta === 0) return;

    if (effect.target?.type === TargetType.LEADER) {
      ctx.getPlayer(effect.owner).statsChanged();
    } else if (effect.target?.type === TargetType.UNIT) {
      const unit = ctx.field.getUnitById(effect.target.unitId);
      unit?.statsChanged();
    }
  }
}
