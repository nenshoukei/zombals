import { cardRegistry, DefinitionRegistry } from './registry';
import { Definition, GameDefinitionError, Id } from './types';
import { WarriorSkill } from '@/definition/card/tention_skill_card/00_basic/001_warrior_skill';

type DummyDefinition = Definition & { name: string };

describe('DefinitionRegistry', () => {
  it('registers definitions', () => {
    const registry = new DefinitionRegistry<DummyDefinition>('testRegistry');
    const dummy1: DummyDefinition = { id: 1 as Id, name: 'foo' };
    const dummy2: DummyDefinition = { id: 2 as Id, name: 'bar' };
    registry.register(dummy1);
    registry.register(dummy2);

    const got1 = registry.getById(1);
    expect(got1).toBe(dummy1);

    const got2 = registry.getById(2);
    expect(got2).toBe(dummy2);
  });

  it('throws GameDefinitionError when registering duplicated ID', () => {
    const registry = new DefinitionRegistry<DummyDefinition>('testRegistry');
    registry.register({ id: 1 as Id, name: 'foo' });

    expect(() => {
      registry.register({ id: 1 as Id, name: 'test' });
    }).toThrow(new GameDefinitionError('testRegistry: Duplicated definition ID: 1'));
  });

  it('throws GameDefinitionError when getting not registered ID', () => {
    const registry = new DefinitionRegistry<DummyDefinition>('testRegistry');

    expect(() => {
      registry.getById(999);
    }).toThrow(new GameDefinitionError('testRegistry: No such definition ID: 999'));
  });
});

describe('cardRegistry', () => {
  it("has Warrior's tention skill registered", () => {
    const card = cardRegistry.getByDef(WarriorSkill);
    expect(card).not.toBeNull();
    expect(card.name.ja).toBe('稲妻の加護');
  });
});
