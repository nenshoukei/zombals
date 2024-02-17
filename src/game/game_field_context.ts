import { GameFieldBuildingContext } from './game_field_building_context';
import { GameFieldUnitContext } from './game_field_unit_context';
import { GameFloorContext } from './game_floor_context';
import { cardRegistry, floorRegistry } from '@/registry';
import {
  AttackableContext,
  BuildingCardDefinition,
  BuildingCardState,
  BY_LEADER,
  CELL_TO_LEADER,
  CellPosition,
  CELLS,
  FieldBuildingContext,
  FieldBuildingState,
  FieldContext,
  FieldObjectContext,
  FieldObjectState,
  FieldState,
  FieldUnitContext,
  FieldUnitState,
  FloorContext,
  FloorDefinition,
  FloorState,
  GameActionType,
  GameContext,
  GameRuntimeError,
  getCurrentTime,
  Id,
  LeaderCellPosition,
  LeaderPosition,
  LEADERS_AND_CELLS,
  SIDE_ROW_TO_CELLS,
  SideRowPosition,
  TargetLeader,
  TargetType,
  TargetUnit,
  UnitCardDefinition,
  UnitCardState,
} from '@/types';

export class GameFieldContext implements FieldContext {
  private _cachedFieldUnitContext = new WeakMap<FieldObjectState, FieldUnitContext>();
  private _cachedFieldBuildingContext = new WeakMap<FieldObjectState, FieldBuildingContext>();
  private _cachedFloorContext = new WeakMap<FloorState, FloorContext>();
  private _idToPositionMap: { [k in Id]?: CellPosition } = {};

  constructor(
    private _game: GameContext,
    private _state: FieldState,
  ) {}

  get state() {
    return this._state;
  }

  updateState(newState: FieldState): void {
    this._state = newState;
    this._game.updateState({
      ...this._game.state,
      field: newState,
    });

    // ID → セル位置の対応表を更新
    this._idToPositionMap = {};
    for (const [cell, object] of Object.entries(newState.objectMap)) {
      this._idToPositionMap[object.id] = cell as CellPosition;
    }
    for (const [cell, floor] of Object.entries(newState.floorMap)) {
      this._idToPositionMap[floor.id] = cell as CellPosition;
    }
  }

  getFieldUnitContext(unit: FieldUnitState): FieldUnitContext {
    const cached = this._cachedFieldUnitContext.get(unit);
    if (cached) return cached;

    const context = new GameFieldUnitContext(this._game, this, unit);
    this._cachedFieldUnitContext.set(unit, context);
    return context;
  }

  getFieldBuildingContext(building: FieldBuildingState): FieldBuildingContext {
    const cached = this._cachedFieldBuildingContext.get(building);
    if (cached) return cached;

    const context = new GameFieldBuildingContext(this._game, this, building);
    this._cachedFieldBuildingContext.set(building, context);
    return context;
  }

  getFloorContext(floor: FloorState): FloorContext {
    const cached = this._cachedFloorContext.get(floor);
    if (cached) return cached;

    const context = new GameFloorContext(this._game, this, floor);
    this._cachedFloorContext.set(floor, context);
    return context;
  }

  updateFieldObjectState(newState: FieldObjectState): void {
    const cell = this._idToPositionMap[newState.id];
    if (!cell || !this.state.objectMap[cell]) {
      throw new GameRuntimeError('GameFieldContext.updateFieldObjectState: Try to update object not in field');
    }

    const newObjectMap = { ...this.state.objectMap };
    newObjectMap[cell] = newState;

    this.updateState({
      ...this.state,
      objectMap: newObjectMap,
    });
  }

  updateFloorState(newState: FloorState): void {
    const cell = this._idToPositionMap[newState.id];
    if (!cell || !this.state.floorMap[cell]) {
      throw new GameRuntimeError('GameFieldContext.updateFloorState: Try to update floor not in field');
    }

    const newFloorMap = { ...this.state.floorMap };
    newFloorMap[cell] = newState;

    this.updateState({
      ...this.state,
      floorMap: newFloorMap,
    });
  }

  getAllAttackTargets(): AttackableContext[] {
    return LEADERS_AND_CELLS.map((pos) => this.getAttackTargetAt(pos)).filter((t): t is AttackableContext => t !== null);
  }

  getAllAttackTargetsOfLeader(leader: LeaderPosition): AttackableContext[] {
    return BY_LEADER[leader].allyLeaderAndCells.map((pos) => this.getAttackTargetAt(pos)).filter((t): t is AttackableContext => t !== null);
  }

  getAttackTargetAt(pos: LeaderCellPosition): AttackableContext | null {
    if (pos === 'AL' || pos === 'BL') {
      return this._game.getPlayer(pos);
    } else {
      const obj = this.state.objectMap[pos];
      if (!obj || obj.type !== 'UNIT') return null;
      return this.getFieldUnitContext(obj);
    }
  }

  getAttackTargetByTarget(target: TargetLeader | TargetUnit): AttackableContext | null {
    if (target.type === TargetType.LEADER) {
      return this.getAttackTargetAt(target.position);
    } else {
      const cell = this.getUnitPositionById(target.unitId);
      if (!cell) return null;
      return this.getAttackTargetAt(cell);
    }
  }

  getAllUnits(): FieldUnitContext[] {
    return CELLS.map((pos) => this.getUnitAt(pos)).filter((t): t is FieldUnitContext => t !== null);
  }

  getAllUnitsOfLeader(leader: LeaderPosition): FieldUnitContext[] {
    return BY_LEADER[leader].allyCells.map((pos) => this.getUnitAt(pos)).filter((t): t is FieldUnitContext => t !== null);
  }

  getUnitAt(cell: CellPosition): FieldUnitContext | null {
    const obj = this.state.objectMap[cell];
    if (!obj || obj.type !== 'UNIT') return null;
    return this.getFieldUnitContext(obj);
  }

  getUnitById(unitId: Id): FieldUnitContext | null {
    const cell = this._idToPositionMap[unitId];
    return cell ? this.getUnitAt(cell) : null;
  }

  getUnitPositionById(unitId: Id): CellPosition | null {
    return this._idToPositionMap[unitId] ?? null;
  }

  private findEmptyCellOfLeader(leader: LeaderPosition): CellPosition | null {
    const cellIndex = BY_LEADER[leader].allyCells.findIndex((cell) => !this.state.objectMap[cell]);
    return cellIndex >= 0 ? BY_LEADER[leader].allyCells[cellIndex] : null;
  }

  putUnitDefForLeader(unitDef: UnitCardDefinition, leader: LeaderPosition): FieldUnitContext | null {
    const cell = this.findEmptyCellOfLeader(leader);
    if (!cell) return null;
    return this.putUnitDefAt(unitDef, cell);
  }

  putUnitCard(unit: UnitCardState): FieldUnitContext | null {
    const cell = this.findEmptyCellOfLeader(unit.owner);
    if (!cell) return null;
    return this.putUnitCardAt(unit, cell);
  }

  putUnitDefAt(unitDef: UnitCardDefinition, cell: CellPosition): FieldUnitContext {
    const leader = CELL_TO_LEADER[cell];
    const unit = unitDef.createState(this._game, leader);
    return this.putUnitCardAt(unit, cell);
  }

  putUnitCardAt(unit: UnitCardState, cell: CellPosition): FieldUnitContext {
    if (unit.owner !== CELL_TO_LEADER[cell]) {
      throw new GameRuntimeError('GameFieldContext.putUnitCardAt: Mismatching of card owner and cell leader');
    }
    if (this.state.objectMap[cell]) {
      throw new GameRuntimeError('GameFieldContext.putUnitCardAr: Object already exists at the cell ' + cell);
    }

    const fieldUnitState: FieldUnitState = {
      type: 'UNIT',
      id: this._game.generateStateID(),
      unitDefId: unit.cardDefId,
      owner: unit.owner,
      basePower: unit.power,
      baseMaxHP: unit.maxHP,
      currentHP: unit.maxHP,
      summonedTurn: this._game.state.turn,
      turnAttackCount: 0,
    };

    this.updateState({
      ...this.state,
      objectMap: {
        ...this.state.objectMap,
        [cell]: fieldUnitState,
      },
    });
    this._game.emitAction({
      type: GameActionType.UNIT_PUT,
      actor: fieldUnitState.owner,
      position: cell,
      unit: fieldUnitState,
      timestamp: getCurrentTime(),
    });

    // フィールドユニット作成イベント呼び出し
    const def = cardRegistry.getById(unit.cardDefId) as UnitCardDefinition;
    def.onFieldUnitCreated(this._game, fieldUnitState);

    // 地形があったらユニットが乗ったイベント呼び出し
    const floor = this.getFloorAt(cell);
    if (floor) {
      const floorDef = floorRegistry.getById(floor.state.floorDefId);
      floorDef.onUnitStepIn(this._game, floor.state, fieldUnitState);
    }

    return this.getUnitAt(cell)!;
  }

  getBuildingAt(cell: CellPosition): FieldBuildingContext | null {
    const obj = this.state.objectMap[cell];
    if (!obj || obj.type !== 'BUILDING') return null;
    return this.getFieldBuildingContext(obj);
  }

  getBuildingById(buildingId: Id): FieldBuildingContext | null {
    const cell = this._idToPositionMap[buildingId];
    return cell ? this.getBuildingAt(cell) : null;
  }

  getBuildingPositionById(buildingId: Id): CellPosition | null {
    return this._idToPositionMap[buildingId] ?? null;
  }

  putBuildingDefAt(buildingDef: BuildingCardDefinition, cell: CellPosition): FieldBuildingContext {
    const leader = CELL_TO_LEADER[cell];
    const building = buildingDef.createState(this._game, leader);
    return this.putBuildingCardAt(building, cell);
  }

  putBuildingCardAt(building: BuildingCardState, cell: CellPosition): FieldBuildingContext {
    if (building.owner !== CELL_TO_LEADER[cell]) {
      throw new GameRuntimeError('GameFieldContext.putBuildingCardAt: Mismatching of card owner and cell leader');
    }
    if (this.state.objectMap[cell]) {
      throw new GameRuntimeError('GameFieldContext.putBuildingCardAt: Object already exists at the cell ' + cell);
    }

    const fieldBuildingState: FieldBuildingState = {
      id: this._game.generateStateID(),
      type: 'BUILDING',
      buildingDefId: building.cardDefId,
      owner: building.owner,
      durability: (cardRegistry.getById(building.cardDefId) as BuildingCardDefinition).durability,
    };

    this.updateState({
      ...this.state,
      objectMap: {
        ...this.state.objectMap,
        [cell]: fieldBuildingState,
      },
    });
    this._game.emitAction({
      type: GameActionType.BULDING_PUT,
      actor: fieldBuildingState.owner,
      position: cell,
      building: fieldBuildingState,
      timestamp: getCurrentTime(),
    });

    // フィールド建物作成イベント呼び出し
    const def = cardRegistry.getById(building.cardDefId) as BuildingCardDefinition;
    def.onCreate(this._game, fieldBuildingState);

    return this.getBuildingAt(cell)!;
  }

  removeObject(object: FieldObjectState, reason: 'DESTROYED' | 'EXILED'): void {
    const cell = this.getPositionOfObject(object);
    if (!cell) {
      throw new GameRuntimeError('GameFieldContext.removeObject: No object exists in the field');
    }

    const newObjectMap = { ...this.state.objectMap };
    delete newObjectMap[cell];

    this.updateState({
      ...this.state,
      objectMap: newObjectMap,
    });
    this._cachedFieldUnitContext.delete(object);
    this._cachedFieldBuildingContext.delete(object);

    switch (object.type) {
      case 'UNIT': {
        // 持続効果をすべて削除 (効果対象としての効果と効果源としての効果両方)
        this._game.removeAllEffectsByTarget({ type: TargetType.UNIT, unitId: object.id });
        this._game.removeAllEffectsBySource({ type: TargetType.UNIT, unitId: object.id });

        // ユニット死亡/追放時イベント
        const unitDef = cardRegistry.getById(object.unitDefId) as UnitCardDefinition;
        switch (reason) {
          case 'DESTROYED': {
            this._game.getPlayer(object.owner).addDeadUnitDefId(unitDef.id);

            this._game.emitAction({
              type: GameActionType.UNIT_DESTROYED,
              actor: object.owner,
              position: cell,
              timestamp: getCurrentTime(),
            });

            unitDef.onFieldUnitDestoyed(this._game, object);
            break;
          }
          case 'EXILED': {
            this._game.emitAction({
              type: GameActionType.UNIT_EXILED,
              actor: object.owner,
              position: cell,
              timestamp: getCurrentTime(),
            });

            unitDef.onFieldUnitExiled(this._game, object);
            break;
          }
        }

        // 地形があったらユニットが死亡イベント呼び出し
        if (reason === 'DESTROYED') {
          const floor = this.getFloorAt(cell);
          if (floor) {
            const floorDef = floorRegistry.getById(floor.state.floorDefId);
            floorDef.onUnitStepOut(this._game, floor.state, object); // 地形を離れたイベントも発火
            floorDef.onUnitDeath(this._game, floor.state, object);
          }
        }

        break;
      }
      case 'BUILDING': {
        // この建物による持続効果をすべて削除
        this._game.removeAllEffectsBySource({ type: TargetType.BUILDING, buildingId: object.id });

        // 建物破壊時イベント
        const buildingDef = cardRegistry.getById(object.buildingDefId) as BuildingCardDefinition;
        if (reason === 'DESTROYED') {
          this._game.emitAction({
            type: GameActionType.BULDING_DESTROED,
            actor: object.owner,
            position: cell,
            timestamp: getCurrentTime(),
          });

          buildingDef.onDestroy(this._game, object);
        }
        break;
      }
    }
  }

  putFloorDefAt(floorDef: FloorDefinition, cell: CellPosition): FloorContext {
    if (this.state.floorMap[cell]) {
      throw new GameRuntimeError('GameFieldContext.putFloorAt: Floor already exists at the cell ' + cell);
    }

    const newFloorState: FloorState = {
      id: this._game.generateStateID(),
      floorDefId: floorDef.id,
      owner: CELL_TO_LEADER[cell],
      storage: floorDef.initialStorage,
    };
    return this.putFloorAt(newFloorState, cell);
  }

  putFloorAt(floor: FloorState, cell: CellPosition): FloorContext {
    if (floor.owner !== CELL_TO_LEADER[cell]) {
      throw new GameRuntimeError('GameFieldContext.putFloorAt: Mismatching of floor owner and cell leader');
    }
    if (this.state.floorMap[cell]) {
      throw new GameRuntimeError('GameFieldContext.putFloorAt: Floor already exists at the cell ' + cell);
    }

    this.updateState({
      ...this.state,
      floorMap: {
        ...this.state.floorMap,
        [cell]: floor,
      },
    });
    this._game.emitAction({
      type: GameActionType.FLOOR_PUT,
      actor: floor.owner,
      position: cell,
      floor,
      timestamp: getCurrentTime(),
    });

    // フィールド地形作成イベント呼び出し
    const def = floorRegistry.getById(floor.floorDefId);
    def.onCreate(this._game, floor);

    return this.getFloorAt(cell)!;
  }

  moveUnitPositionTo(from: CellPosition, to: CellPosition): void {
    if (from === to) return;

    const unit = this.getUnitAt(from);
    // 移動元にユニットがいない
    if (!unit) return;
    // 移動元ユニットが移動不可
    if (!unit.isMovable()) return;
    // 移動先にオブジェクトがある
    if (this.state.objectMap[to]) return;
    // 敵・味方をまたいでの移動はしない
    if (CELL_TO_LEADER[from] !== CELL_TO_LEADER[to]) return;

    const newObjectMap = { ...this.state.objectMap };
    newObjectMap[to] = newObjectMap[from];
    delete newObjectMap[from];

    this.updateState({
      ...this.state,
      objectMap: newObjectMap,
    });

    this._game.emitAction({
      type: GameActionType.UNIT_MOVE,
      actor: unit.state.owner,
      from,
      to,
      timestamp: getCurrentTime(),
    });

    // 移動元に地形があったらユニットが離れたイベント呼び出し
    const floorFrom = this.getFloorAt(from);
    if (floorFrom) {
      const floorDef = floorRegistry.getById(floorFrom.state.floorDefId);
      floorDef.onUnitStepOut(this._game, floorFrom.state, unit.state);
    }

    // 移動先に地形があったらユニットが乗ったイベント呼び出し
    const floorTo = this.getFloorAt(to);
    if (floorTo) {
      const floorDef = floorRegistry.getById(floorTo.state.floorDefId);
      floorDef.onUnitStepIn(this._game, floorTo.state, unit.state);
    }
  }

  swapUnitPositions(cell1: CellPosition, cell2: CellPosition): void {
    if (cell1 === cell2) return;

    const unit1 = this.getUnitAt(cell1);
    const unit2 = this.getUnitAt(cell2);
    // いずれもユニットがいない
    if (!unit1 && !unit2) return;
    // どちらかが移動不可
    if ((unit1 && !unit1.isMovable()) || (unit2 && !unit2.isMovable())) return;
    // どちらかに建物がある
    if (this.getBuildingAt(cell1) || this.getBuildingAt(cell2)) return;
    // 敵・味方をまたいでの移動はしない
    if (CELL_TO_LEADER[cell1] !== CELL_TO_LEADER[cell2]) return;

    const newObjectMap = { ...this.state.objectMap };
    const obj1 = newObjectMap[cell1];
    const obj2 = newObjectMap[cell2];
    newObjectMap[cell1] = obj2;
    newObjectMap[cell2] = obj1;

    this.updateState({
      ...this.state,
      objectMap: newObjectMap,
    });
    this._game.emitAction({
      type: GameActionType.UNIT_SWAP,
      actor: CELL_TO_LEADER[cell1],
      position1: cell1,
      position2: cell2,
      timestamp: getCurrentTime(),
    });

    // セルに地形があったらユニットが乗った/離れたイベント呼び出し
    const floor1 = this.getFloorAt(cell1);
    const floor1Def = floor1 && floorRegistry.getById(floor1.state.floorDefId);
    const floor2 = this.getFloorAt(cell2);
    const floor2Def = floor2 && floorRegistry.getById(floor2.state.floorDefId);
    if (floor1Def && unit1) {
      floor1Def.onUnitStepOut(this._game, floor1.state, unit1.state);
    }
    if (floor2Def && unit2) {
      floor2Def.onUnitStepOut(this._game, floor2.state, unit2.state);
    }
    if (floor2Def && unit1) {
      floor2Def.onUnitStepIn(this._game, floor2.state, unit1.state);
    }
    if (floor1Def && unit2) {
      floor1Def.onUnitStepIn(this._game, floor1.state, unit2.state);
    }
  }

  swapUnitPositionsOnSideRow(sideRow: SideRowPosition): void {
    const [cell1, cell2] = SIDE_ROW_TO_CELLS[sideRow];
    this.swapUnitPositions(cell1, cell2);
  }

  changeControllerOfUnit(target: CellPosition): void {
    const unit = this.state.objectMap[target];
    if (!unit || unit.type !== 'UNIT') {
      throw new GameRuntimeError('GameFieldContext.changeControllerOfUnit: No unit exists at the cell ' + target);
    }

    const enemyLeader = BY_LEADER[unit.owner].enemyLeader;
    const toCell = this.findEmptyCellOfLeader(enemyLeader);
    if (!toCell) {
      // 移動先の空きマスが見つからなかった
      return;
    }

    const newUnit: FieldUnitState = {
      ...unit,
      owner: enemyLeader,
    };

    const newObjectMap = { ...this.state.objectMap };
    newObjectMap[toCell] = newUnit;
    this.updateState({
      ...this.state,
      objectMap: newObjectMap,
    });

    this._game.emitAction({
      type: GameActionType.UNIT_OWNER_CHANGED,
      actor: enemyLeader,
      from: target,
      to: toCell,
      timestamp: getCurrentTime(),
    });

    // 移動元に地形があったらユニットが離れたイベント呼び出し
    const floorFrom = this.getFloorAt(target);
    if (floorFrom) {
      const floorDef = floorRegistry.getById(floorFrom.state.floorDefId);
      floorDef.onUnitStepOut(this._game, floorFrom.state, unit);
    }

    // 移動先に地形があったらユニットが乗ったイベント呼び出し
    const floorTo = this.getFloorAt(toCell);
    if (floorTo) {
      const floorDef = floorRegistry.getById(floorTo.state.floorDefId);
      floorDef.onUnitStepIn(this._game, floorTo.state, newUnit);
    }
  }

  getObjectAt(cell: CellPosition): FieldObjectContext | null {
    const obj = this.state.objectMap[cell];
    if (!obj) return null;

    switch (obj.type) {
      case 'UNIT':
        return this.getUnitAt(cell);
      case 'BUILDING':
        return this.getBuildingAt(cell);
    }
  }

  getPositionOfObject(object: FieldObjectState): CellPosition | null {
    return this._idToPositionMap[object.id] ?? null;
  }

  isFullObjectForLeader(leader: LeaderPosition): boolean {
    return BY_LEADER[leader].allyCells.every((cell) => {
      return !!this.state.objectMap[cell];
    });
  }

  getFloorAt(cell: CellPosition): FloorContext | null {
    const floor = this.state.floorMap[cell];
    if (!floor) return null;
    return this.getFloorContext(floor);
  }

  getFloorById(floorId: Id): FloorContext | null {
    const cell = this._idToPositionMap[floorId];
    return cell ? this.getFloorAt(cell) : null;
  }

  getFloorPositionById(floorId: Id): CellPosition | null {
    return this._idToPositionMap[floorId] ?? null;
  }

  getPositionOfFloor(floor: FloorState): CellPosition | null {
    return this._idToPositionMap[floor.id] ?? null;
  }

  removeFloor(floor: FloorState): void {
    const cell = this.getPositionOfFloor(floor);
    if (!cell) {
      throw new GameRuntimeError('GameFieldContext.removeFloor: No floor exists in the field');
    }

    const newFloorMap = { ...this.state.floorMap };
    delete newFloorMap[cell];

    this.updateState({
      ...this.state,
      floorMap: newFloorMap,
    });
    this._cachedFloorContext.delete(floor);

    // 持続効果をすべて削除 (効果対象としての効果と効果源としての効果両方)
    this._game.removeAllEffectsByTarget({ type: TargetType.FLOOR, floorId: floor.id });
    this._game.removeAllEffectsBySource({ type: TargetType.FLOOR, floorId: floor.id });

    this._game.emitAction({
      type: GameActionType.FLOOR_DESTROYED,
      actor: floor.owner,
      position: cell,
      timestamp: getCurrentTime(),
    });

    const floorDef = floorRegistry.getById(floor.floorDefId);
    floorDef.onDestroy(this._game, floor);
  }

  isCellOwnedBy(cell: CellPosition, leader: LeaderPosition): boolean {
    return CELL_TO_LEADER[cell] === leader;
  }
}
