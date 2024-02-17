import { BaseEffectDefinition } from '../../types/definition/effect';
import { EffectState, EffectTargetType, GameContext, Id, LocaleString } from '@/types';

export type WeaponBuffEffectStorage = {
  /** 攻撃力の変化量 */
  delta: number;
};

/**
 * リーダーの装備武器の攻撃力を増やす効果
 */
export class WeaponBuffEffect extends BaseEffectDefinition<WeaponBuffEffectStorage> {
  static readonly id = 4 as Id;

  constructor() {
    super({
      id: WeaponBuffEffect.id,
      targetTypes: [EffectTargetType.LEADER],
      isDescriptionMerged: true,
    });
  }

  getMergedDescription(ctx: GameContext, effects: EffectState<WeaponBuffEffectStorage>[]): LocaleString | null {
    let totalDelta = 0;
    for (const effect of effects) {
      totalDelta += effect.storage.delta;
    }
    return {
      ja: `味方リーダーの武器ダメージ+${totalDelta}`,
    };
  }

  onAdded(ctx: GameContext, effect: EffectState<WeaponBuffEffectStorage>): void {
    // 攻撃力が変更されるので通知
    ctx.getPlayer(effect.owner).statsChanged();
  }

  onRemoved(ctx: GameContext, effect: EffectState<WeaponBuffEffectStorage>): void {
    // 攻撃力が変更されるので通知
    ctx.getPlayer(effect.owner).statsChanged();
  }
}
