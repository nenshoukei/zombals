import { BaseFloorDefinition } from '../../types/definition/floor';
import { WeaponBuffEffect } from '../effect/004_weapon_buff_effect';
import { effectRegistry } from '@/registry';
import { EffectSourceType, EffectTargetType, FloorState, GameContext, Id, LocaleString } from '@/types';

export type SwordEnhanceFloorStorage = {
  effectId: Id | null;
};

export class SwordEnhanceFloor extends BaseFloorDefinition<SwordEnhanceFloorStorage> {
  static readonly id = 1 as Id;

  constructor() {
    super({
      id: SwordEnhanceFloor.id,
      name: {
        ja: '刃の紋章',
      },
      initialStorage: {
        effectId: null,
      },
    });
  }

  getCurrentDescription(): LocaleString {
    return {
      ja: `味方リーダーの武器の攻撃力+1`,
    };
  }

  onUnitStepIn(ctx: GameContext, floor: FloorState<SwordEnhanceFloorStorage>): void {
    const def = effectRegistry.getByDef(WeaponBuffEffect);

    // 武器攻撃力バフ
    const effect = def.createState({
      ctx,
      owner: floor.owner,
      source: { type: EffectSourceType.FLOOR, floorId: floor.id },
      target: { type: EffectTargetType.LEADER, position: floor.owner },
      initialStorage: {
        delta: 1,
      },
    });

    floor.storage.effectId = effect.id;
    ctx.addEffect(effect);
  }

  onUnitStepOut(ctx: GameContext, floor: FloorState<SwordEnhanceFloorStorage>): void {
    if (floor.storage.effectId) {
      ctx.removeEffect(floor.storage.effectId);
      floor.storage.effectId = null;
    }
  }
}
