import {
  CellPosition,
  EffectSource,
  EffectSourceType,
  FieldContext,
  FloorContext,
  FloorState,
  GameContext,
  GameRuntimeError,
  TargetFloor,
  TargetType,
} from '@/types';

export class GameFloorContext implements FloorContext {
  constructor(
    private _game: GameContext,
    private _field: FieldContext,
    private _state: FloorState,
  ) {}

  get state() {
    return this._state;
  }

  get position(): CellPosition {
    const position = this._field.getPositionOfFloor(this._state);
    if (!position) {
      throw new GameRuntimeError('GameFloorContext.position: not in field');
    }
    return position;
  }

  get asTarget(): Readonly<TargetFloor> {
    return {
      type: TargetType.FLOOR,
      floorId: this.state.id,
    };
  }

  get asEffectSource(): EffectSource {
    return {
      type: EffectSourceType.FLOOR,
      floorId: this.state.id,
    };
  }

  updateState(newState: FloorState): void {
    this._state = newState;
    this._field.updateFloorState(newState);
  }

  destroy(): void {
    // フィールドから取り除く
    this._field.removeFloor(this.state);
  }
}
