import { LocaleString } from '../common';
import { GameContext } from '../context';
import { EffectState, Storage } from '../game_state';
import { CreateEffectStateParams, EffectDefinition } from './base';

export type BaseEffectDefinitionInit<TStorage extends Storage | null> = Pick<
  EffectDefinition<TStorage>,
  'id' | 'targetTypes' | 'isDescriptionMerged'
>;

/**
 * 持続効果の定義
 */
export abstract class BaseEffectDefinition<TStorage extends Storage | null = Storage | null> implements EffectDefinition<TStorage> {
  constructor(protected defs: BaseEffectDefinitionInit<TStorage>) {}

  get id() {
    return this.defs.id;
  }

  get targetTypes() {
    return this.defs.targetTypes;
  }

  get isDescriptionMerged() {
    return this.defs.isDescriptionMerged;
  }

  createState({ ctx, owner, target, source, endTiming, initialStorage }: CreateEffectStateParams<TStorage>): EffectState<TStorage> {
    return {
      id: ctx.generateStateID(),
      effectDefId: this.id,
      owner,
      target,
      source,
      endTiming,
      storage: { ...initialStorage },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCurrentDescription(ctx: GameContext, effect: EffectState<TStorage>): LocaleString | null {
    // デフォルトでは表示しない
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMergedDescription(ctx: GameContext, effects: EffectState<TStorage>[]): LocaleString | null {
    // デフォルトでは表示しない
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAdded(ctx: GameContext, effect: EffectState<TStorage>): void {
    // デフォルトは何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRemoved(ctx: GameContext, effect: EffectState<TStorage>): void {
    // デフォルトは何もしない
  }

  toString(): string {
    return `[EffectDefinition #${this.id}]`;
  }
}
