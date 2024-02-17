import * as badgeDefinitions from './definition/badge';
import * as cardDefinitions from './definition/card';
import * as effectDefinitions from './definition/effect';
import * as floorDefinitions from './definition/floor';
import {
  BadgeDefinition,
  CardDefinitionBase,
  Definition,
  DefinitionClass,
  EffectDefinition,
  FloorDefinition,
  GameDefinitionError,
} from './types';

/**
 * 定義のレジストリクラス
 */
export class DefinitionRegistry<T extends Definition> {
  private map: Map<number, T>;

  constructor(private _name: string) {
    this.map = new Map();
  }

  get name(): string {
    return this._name;
  }

  registerModules(modules: Record<string, unknown>): void {
    Object.values(modules).forEach((module) => {
      if (typeof module === 'function' && typeof module.constructor === 'function') {
        const obj = new (module as DefinitionClass<T>)();
        this.register(obj);
      }
    });
  }

  register(definition: T): void {
    if (this.map.has(definition.id)) {
      throw new GameDefinitionError(`${this._name}: Duplicated definition ID: ${definition.id}`);
    }
    this.map.set(definition.id, definition);
  }

  getByDef<TDef extends T>(definition: { id: number; new (): TDef }): TDef {
    const found = this.map.get(definition.id);
    if (!found) {
      throw new GameDefinitionError(`${this._name}: No such definition ID: ${definition.id}`);
    }
    return found as unknown as TDef;
  }

  getById(definitionId: number): T {
    const found = this.map.get(definitionId);
    if (!found) {
      throw new GameDefinitionError(`${this._name}: No such definition ID: ${definitionId}`);
    }
    return found;
  }

  scanAll(): IterableIterator<T> {
    return this.map.values();
  }
}

/**
 * パワフルバッジ定義のレジストリ
 */
export const badgeRegistry = new DefinitionRegistry<BadgeDefinition>('badgeRegistry');
badgeRegistry.registerModules(badgeDefinitions);

/**
 * カード定義のレジストリ
 */
export const cardRegistry = new DefinitionRegistry<CardDefinitionBase>('cardRegistry');
cardRegistry.registerModules(cardDefinitions);

/**
 * 持続効果定義のレジストリ
 */
export const effectRegistry = new DefinitionRegistry<EffectDefinition>('effectRegistry');
effectRegistry.registerModules(effectDefinitions);

/**
 * フィールド地形定義のレジストリ
 */
export const floorRegistry = new DefinitionRegistry<FloorDefinition>('floorRegistry');
floorRegistry.registerModules(floorDefinitions);
