import {
  BuildingStatsUpdateAction,
  CELL_TO_COLUMN,
  CELL_TO_ROW,
  CELL_TO_SIDE_ROW,
  CellPosition,
  ColumnPosition,
  EffectSource,
  EffectSourceType,
  FieldBuildingContext,
  FieldBuildingState,
  FieldContext,
  GameActionType,
  GameContext,
  GameRuntimeError,
  getCurrentTime,
  RowPosition,
  SideRowPosition,
  TargetBuilding,
  TargetType,
} from '@/types';

export class GameFieldBuildingContext implements FieldBuildingContext {
  constructor(
    private _game: GameContext,
    private _field: FieldContext,
    private _state: FieldBuildingState,
  ) {}

  get state() {
    return this._state;
  }

  get position(): CellPosition {
    const position = this._field.getPositionOfObject(this._state);
    if (!position) {
      throw new GameRuntimeError('GameFieldUnitContext.position: not in field');
    }
    return position;
  }

  get row(): RowPosition {
    return CELL_TO_ROW[this.position];
  }

  get column(): ColumnPosition {
    return CELL_TO_COLUMN[this.position];
  }

  get sideRow(): SideRowPosition {
    return CELL_TO_SIDE_ROW[this.position];
  }

  get asTarget(): Readonly<TargetBuilding> {
    return {
      type: TargetType.BUILDING,
      buildingId: this.state.id,
    };
  }

  get asEffectSource(): EffectSource {
    return {
      type: EffectSourceType.BUILDING,
      buildingId: this.state.id,
    };
  }

  get durability(): number {
    return this._state.durability;
  }

  updateState(newState: FieldBuildingState): void {
    const statsChanged = this._state.durability !== newState.durability;

    this._state = newState;
    this._field.updateFieldObjectState(newState);

    if (statsChanged) {
      this.statsChanged();
    }
  }

  destroy(): void {
    // フィールドから取り除く
    this._field.removeObject(this.state, 'DESTROYED');
  }

  private lastNotifiedStats: BuildingStatsUpdateAction | undefined;
  statsChanged(): void {
    const newStats: BuildingStatsUpdateAction = {
      type: GameActionType.BULDING_STATS_UPDATE,
      actor: this.state.owner,
      position: this.position,
      durability: this.durability,
      timestamp: getCurrentTime(),
    };

    if (!this.lastNotifiedStats || this.lastNotifiedStats.durability !== newStats.durability) {
      this._game.emitAction(newStats);
      this.lastNotifiedStats = newStats;
    }
  }
}
