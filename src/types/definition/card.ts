import { CardPack, CardType, Id, LocaleString } from '../common';
import { GameContext } from '../context';
import { GameDefinitionError } from '../errors';
import { LeaderPosition, Target, TargetType } from '../field';
import { CardState } from '../game_state';
import { CardDefinition, CardDefinitionBase } from './base';

export type BaseCardDefinitionInit = Pick<
  CardDefinition,
  'type' | 'id' | 'name' | 'description' | 'cost' | 'job' | 'rarity' | 'pack' | 'targetTypes' | 'additionalTargetTypes' | 'isToken'
>;

/**
 * カード定義
 */
export abstract class BaseCardDefinition<TInit extends BaseCardDefinitionInit, TState extends CardState>
  implements CardDefinitionBase<TState>
{
  /**
   * パックとカード種別を元にカード ID を生成するヘルパー。
   */
  protected static generateId(cardPack: CardPack, cardType: CardType, localId: number): Id {
    if (localId >= 1000) throw new GameDefinitionError('Too large localId: ' + localId);
    return (cardPack * 100000 + cardType * 1000 + localId) as Id;
  }

  protected readonly init: TInit;

  constructor(defs: TInit) {
    this.init = defs;
  }

  get type(): TInit['type'] {
    return this.init.type;
  }

  get id() {
    return this.init.id;
  }

  get name() {
    return this.init.name;
  }

  get description() {
    return this.init.description;
  }

  get cost() {
    return this.init.cost;
  }

  get job() {
    return this.init.job;
  }

  get rarity() {
    return this.init.rarity;
  }

  get pack() {
    return this.init.pack;
  }

  get targetTypes() {
    return this.init.targetTypes;
  }

  get additionalTargetTypes() {
    return this.init.additionalTargetTypes;
  }

  get isToken() {
    return this.init.isToken;
  }

  abstract createState(ctx: GameContext, owner: LeaderPosition): CardState;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCurrentDescription(ctx: GameContext, card: TState): LocaleString {
    // デフォルトの動作としてカード定義の説明文をそのまま返す
    return this.description;
  }

  isUsable(ctx: GameContext, card: TState): boolean {
    // MP が不足していたら使えない
    if (card.cost > ctx.ally.state.currentMP) {
      return false;
    }
    return true;
  }

  isUsableAt(ctx: GameContext, card: TState, target: Target): boolean {
    // isUsable は通ってきている事を前提としてよい。

    // 選択対象外なら使えない
    if (!this.targetTypes.includes(target.type)) {
      return false;
    }

    return this.isValidTarget(ctx, target);
  }

  isAdditionalUsableAt(ctx: GameContext, card: TState, target: Target): boolean {
    // isUsable は通ってきている事を前提としてよい。

    // 選択対象外なら使えない
    if (!this.additionalTargetTypes || !this.additionalTargetTypes.includes(target.type)) {
      return false;
    }

    return this.isValidTarget(ctx, target);
  }

  protected isValidTarget(ctx: GameContext, target: Target): boolean {
    switch (target.type) {
      case TargetType.UNIT: {
        // ユニットが存在しないなら対象不適正
        const unit = ctx.field.getUnitById(target.unitId);
        if (!unit) {
          return false;
        }
        // ユニットがステルス中または闇の衣中の場合は対象に取れない
        if (unit.isStealth() || unit.isDarkClothed()) {
          return false;
        }
        break;
      }
      case TargetType.FLOOR: {
        // 地形が存在しないなら対象不適正
        if (!ctx.field.getFloorById(target.floorId)) {
          return false;
        }
        break;
      }
      case TargetType.BUILDING: {
        // 建物が存在しないなら対象不適正
        if (!ctx.field.getBuildingById(target.buildingId)) {
          return false;
        }
        break;
      }
    }
    return true;
  }

  abstract use(ctx: GameContext, card: TState, target?: Target, additonalTarget?: Target): void;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onOptionSelected(ctx: GameContext, card: TState, selectIndex: number): void {
    // デフォルトは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onHandSelected(ctx: GameContext, card: TState, selectIndexes: number[]): void {
    // デフォルトは何もしない
  }
}
