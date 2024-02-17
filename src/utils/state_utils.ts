type State = { id: number };

export function replaceStateInArray<T extends State>(array: T[], newState: T): T[] {
  const index = array.findIndex((s) => s.id === newState.id);
  if (index >= 0) {
    return [...array.slice(0, index), newState, ...array.slice(index + 1)];
  } else {
    return array;
  }
}
