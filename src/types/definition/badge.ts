import { LocaleString } from '../common';
import { GameContext } from '../context';
import { LeaderPosition } from '../field';
import { BadgeState, Storage } from '../game_state';
import { BadgeDefinition } from './base';

export type BaseBadgeDefinitionInit<TStorage extends Storage | null> = Pick<BadgeDefinition<TStorage>, 'id' | 'isDescriptionMerged'>;

/**
 * パワフルバッジ定義
 */
export abstract class BaseBadgeDefinition<TStorage extends Storage | null = Storage | null> implements BadgeDefinition<TStorage> {
  constructor(protected init: BaseBadgeDefinitionInit<TStorage>) {}

  get id() {
    return this.init.id;
  }

  get isDescriptionMerged() {
    return this.init.isDescriptionMerged;
  }

  createState(ctx: GameContext, owner: LeaderPosition, storage: TStorage): BadgeState {
    return {
      id: ctx.generateStateID(),
      badgeDefId: this.id,
      owner,
      storage: { ...storage },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCurrentDescription(ctx: GameContext, badge: BadgeState<TStorage>): LocaleString | null {
    // デフォルトでは何も表示しない
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMergedDescription(ctx: GameContext, badges: BadgeState<TStorage>[]): LocaleString | null {
    // デフォルトでは何も表示しない
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAdded(ctx: GameContext, badge: BadgeState<TStorage>): void {
    // デフォルトでは何も表示しない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRemoved(ctx: GameContext, badge: BadgeState<TStorage>): void {
    // デフォルトでは何も表示しない
  }

  toString(): string {
    return `[BadgeDefinition #${this.id}]`;
  }
}
