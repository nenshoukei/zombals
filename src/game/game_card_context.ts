import { CardContext, CardState, GameContext, PlayerContext } from '@/types';

export class GameCardContext<T extends CardState> implements CardContext<T> {
  constructor(
    private _game: GameContext,
    private _player: PlayerContext,
    private _state: T,
  ) {}

  get state() {
    return this._state;
  }

  updateState(newState: T): void {
    this._state = newState;

    // 手札から検索
    const handIndex = this._player.state.hand.findIndex((hc) => hc.id === newState.id);
    if (handIndex >= 0) {
      const newHands = [...this._player.state.hand.slice(0, handIndex), newState, ...this._player.state.hand.slice(handIndex + 1)];
      this._player.updateState({
        ...this._player.state,
        hand: newHands,
      });
      return;
    }

    // 山札から検索
    const libIndex = this._player.state.library.findIndex((lc) => lc.id === newState.id);
    if (libIndex >= 0) {
      const newLibrary = [...this._player.state.library.slice(0, libIndex), newState, ...this._player.state.library.slice(libIndex + 1)];
      this._player.updateState({
        ...this._player.state,
        library: newLibrary,
      });
      return;
    }

    // ゲームから除去されているので何もしない
  }

  changeCost(delta: number): void {
    this.updateState({
      ...this.state,
      cost: Math.max(0, this.state.cost + delta),
    });
  }
}
