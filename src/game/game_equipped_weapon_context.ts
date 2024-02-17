import { GamePlayerContext } from './game_player_context';
import { WeaponBuffEffect, WeaponBuffEffectStorage } from '@/definition/effect/004_weapon_buff_effect';
import { EquippedWeaponContext, EquippedWeaponState, GameContext, GameRuntimeError } from '@/types';

export class GameEquippedWeaponContext implements EquippedWeaponContext {
  constructor(
    private _game: GameContext,
    private _player: GamePlayerContext,
    private _state: EquippedWeaponState,
  ) {}

  get state() {
    return this._state;
  }

  updateState(newState: EquippedWeaponState): void {
    if (!this._player.state.weapon) {
      throw new GameRuntimeError('GameEquippedWeaponContext: Try to update state of not equipped weapon');
    }
    if (this._player.state.weapon.id !== this._state.id) {
      throw new GameRuntimeError('GameEquippedWeaponContext: Try to update state of different equipped weapon');
    }

    this._state = newState;
    this._player.updateState({
      ...this._player.state,
      weapon: newState,
    });
  }

  getCalculatedPower(): number {
    const effects = this._game.findAllEffectsByTargetOrAny(this._player.asTarget);
    let power = this.state.basePower;
    for (const effect of effects) {
      if (effect.effectDefId === WeaponBuffEffect.id) {
        power = Math.max(0, power + (effect.storage as WeaponBuffEffectStorage).delta);
      }
    }
    return power;
  }
}
