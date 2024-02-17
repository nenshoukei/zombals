import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectState, EffectTargetType, GameContext, Id, TargetType } from '@/types';

export type StatsChangeEffectStorage = {
  /** 攻撃力の変化量 (マイナスの場合は減らす) */
  powerDelta: number;
  /** 最大HPの変化量 (マイナスの場合は減らす) */
  maxHPDelta: number;
};

/**
 * ユニットの攻撃力と最大HPを増減させる効果
 */
export class StatsChangeEffect extends BaseEffectDefinition<StatsChangeEffectStorage> {
  static readonly id = 2 as Id;

  constructor() {
    super({
      id: StatsChangeEffect.id,
      targetTypes: [EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }

  onAdded(ctx: GameContext, effect: EffectState<StatsChangeEffectStorage>): void {
    const maxHPDelta = effect.storage.maxHPDelta;
    if (maxHPDelta === 0) return;

    if (effect.target?.type === TargetType.UNIT) {
      const unit = ctx.field.getUnitById(effect.target.unitId);
      if (!unit) return;

      if (maxHPDelta > 0) {
        // 最大 HP が増える場合は残り HP も同じだけ増える
        unit.currentHP = unit.currentHP + maxHPDelta;
      } else if (maxHPDelta < 0) {
        // 最大 HP が減る場合は残り HP もそれに合わせる
        unit.currentHP = Math.min(unit.currentHP, unit.getCalculatedMaxHP());
      }
      unit.statsChanged();
    }
  }

  onRemoved(ctx: GameContext, effect: EffectState<StatsChangeEffectStorage>): void {
    if (effect.target?.type === TargetType.UNIT) {
      const unit = ctx.field.getUnitById(effect.target.unitId);
      if (!unit) return;

      // 最大 HP が減る場合は残り HP もそれに合わせる
      unit.currentHP = Math.min(unit.currentHP, unit.getCalculatedMaxHP());

      unit.statsChanged();
    }
  }
}
