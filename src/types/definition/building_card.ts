import { CardType } from '../common';
import { GameContext } from '../context';
import { LeaderPosition, Target, TargetType } from '../field';
import { BuildingCardState, FieldBuildingState } from '../game_state';
import { BuildingCardDefinition } from './base';
import { BaseCardDefinition, BaseCardDefinitionInit } from './card';

export type BuildingCardDefinitionInit = BaseCardDefinitionInit &
  Pick<BuildingCardDefinition, 'durability' | 'isDungeon'> & {
    type: typeof CardType.BUILDING;
  };

export abstract class BaseBuildingCardDefinition
  extends BaseCardDefinition<BuildingCardDefinitionInit, BuildingCardState>
  implements BuildingCardDefinition
{
  constructor(defs: Omit<BuildingCardDefinitionInit, 'type' | 'targetTypes' | 'additionalTargetTypes'>) {
    super({
      ...defs,
      type: CardType.BUILDING,
      targetTypes: [TargetType.CELL],
    });
  }

  get durability() {
    return this.init.durability;
  }

  get isDungeon() {
    return this.init.isDungeon ?? false;
  }

  createState(ctx: GameContext, owner: LeaderPosition): BuildingCardState {
    return {
      type: CardType.BUILDING,
      id: ctx.generateStateID(),
      cardDefId: this.id,
      owner,
      cost: this.cost,
      proficiencyPlus: 0,
    };
  }

  isUsable(ctx: GameContext, card: BuildingCardState): boolean {
    if (!super.isUsable(ctx, card)) return false;

    if (ctx.field.isFullObjectForLeader(ctx.ally.position)) {
      // フィールドに空きがなければ使用不可
      return false;
    }

    return true;
  }

  isUsableAt(ctx: GameContext, card: BuildingCardState, target: Target): boolean {
    if (!super.isUsableAt(ctx, card, target)) return false;

    if (target.type === TargetType.CELL) {
      // 自分のマスのみ
      if (!ctx.field.isCellOwnedBy(target.position, ctx.ally.position)) {
        return false;
      }

      // 指定マスが空いてなければ使用不可
      if (ctx.field.getObjectAt(target.position)) {
        return false;
      }
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCreate(ctx: GameContext, building: FieldBuildingState): void {
    // デフォルトでは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDestroy(ctx: GameContext, building: FieldBuildingState): void {
    // デフォルトでは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  use(ctx: GameContext, card: BuildingCardState, target?: Target, additionalTarget?: Target): void {
    if (target?.type === TargetType.CELL) {
      // 指定マスに建物カードをプレイ
      ctx.field.putBuildingCardAt(card, target.position);
    }
  }

  toString(): string {
    return `[BuildingCardDefinition #${this.id} ${this.name.ja}]`;
  }
}
