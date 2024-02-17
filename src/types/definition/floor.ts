import { LocaleString } from '../common';
import { GameContext } from '../context';
import { LeaderPosition } from '../field';
import { FieldUnitState, FloorState, Storage } from '../game_state';
import { FloorDefinition } from './base';

export type BaseFloorDefinitionInit<TStorage extends Storage | null> = Pick<FloorDefinition<TStorage>, 'id' | 'name' | 'initialStorage'>;

/**
 * フィールド地形 (床) 定義
 */
export abstract class BaseFloorDefinition<TStorage extends Storage | null = Storage | null> implements FloorDefinition<TStorage> {
  constructor(protected init: BaseFloorDefinitionInit<TStorage>) {}

  get id() {
    return this.init.id;
  }

  get name() {
    return this.init.name;
  }

  get initialStorage() {
    return this.init.initialStorage;
  }

  createState(ctx: GameContext, owner: LeaderPosition, storage?: TStorage): FloorState {
    return {
      id: ctx.generateStateID(),
      floorDefId: this.id,
      owner,
      storage: { ...(storage ?? this.initialStorage) },
    };
  }

  abstract getCurrentDescription(ctx: GameContext, floor: FloorState<TStorage>): LocaleString;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCreate(ctx: GameContext, floor: FloorState<TStorage>): void {
    // デフォルトでは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDestroy(ctx: GameContext, floor: FloorState<TStorage>): void {
    // デフォルトでは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUnitStepIn(ctx: GameContext, floor: FloorState<TStorage>, unit: FieldUnitState): void {
    // デフォルトでは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUnitStepOut(ctx: GameContext, floor: FloorState<TStorage>, unit: FieldUnitState): void {
    // デフォルトでは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUnitDeath(ctx: GameContext, floor: FloorState<TStorage>, unit: FieldUnitState): void {
    // デフォルトでは何もしない
  }

  toString(): string {
    return `[FloorDefinition #${this.id} ${this.name.ja}]`;
  }
}
