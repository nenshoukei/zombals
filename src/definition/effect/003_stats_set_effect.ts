import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectState, EffectTargetType, GameContext, Id, TargetType } from '@/types';

export type StatsSetEffectStorage = {
  /** 新しい攻撃力の値 (上書きしない場合は null) */
  power: number | null;
  /** 新しい最大HPの値 (上書きしない場合は null) */
  maxHP: number | null;
};

/**
 * 攻撃力と最大HPを片方もしくは両方上書き設定する効果
 */
export class StatsSetEffect extends BaseEffectDefinition<StatsSetEffectStorage> {
  static readonly id = 3 as Id;

  constructor() {
    super({
      id: StatsSetEffect.id,
      targetTypes: [EffectTargetType.UNIT],
      isDescriptionMerged: false,
    });
  }

  onAdded(ctx: GameContext, effect: EffectState<StatsSetEffectStorage>): void {
    if (effect.target?.type === TargetType.UNIT) {
      const unit = ctx.field.getUnitById(effect.target.unitId);
      if (!unit) return;

      if (effect.storage.maxHP !== null) {
        // 残り HP も変化
        unit.currentHP = effect.storage.maxHP;
      }

      unit.statsChanged();
    }
  }

  onRemoved(ctx: GameContext, effect: EffectState<StatsSetEffectStorage>): void {
    if (effect.target?.type === TargetType.UNIT) {
      const unit = ctx.field.getUnitById(effect.target.unitId);
      if (!unit) return;

      // 最大 HP が減る場合は残り HP もそれに合わせる
      unit.currentHP = Math.min(unit.currentHP, unit.getCalculatedMaxHP());

      unit.statsChanged();
    }
  }
}
