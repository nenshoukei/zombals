// From https://typescript-jp.gitbook.io/deep-dive/main-1/typed-event
// Modified by Amino

export interface Listener<T> {
  (event: T): void;
}

export interface Disposable {
  dispose(): void;
}

/** passes through events as they happen. You will not get events from before you start listening */
export class TypedEvent<T> {
  private listeners: Listener<T>[] = [];
  private listenersOncer: Listener<T>[] = [];

  on = (listener: Listener<T>): Disposable => {
    this.listeners.push(listener);
    return {
      dispose: () => this.off(listener),
    };
  };

  once = (listener: Listener<T>): void => {
    this.listenersOncer.push(listener);
  };

  off = (listener: Listener<T>) => {
    const callbackIndex = this.listeners.indexOf(listener);
    if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);

    const callbackOnceIndex = this.listenersOncer.indexOf(listener);
    if (callbackOnceIndex > -1) this.listenersOncer.splice(callbackOnceIndex, 1);
  };

  emit = (event: T) => {
    /** Update any general listeners */
    if (this.listeners.length > 0) {
      this.listeners.forEach((listener) => listener(event));
    }

    /** Clear the `once` queue */
    if (this.listenersOncer.length > 0) {
      this.listenersOncer.forEach((listener) => listener(event));
      this.listenersOncer = [];
    }
  };

  pipe = (te: TypedEvent<T>): Disposable => {
    return this.on((e) => te.emit(e));
  };
}
