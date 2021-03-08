/**
 * Create a spreadable object that will only modify the state if the selector exists
 */
export const spreadableIfExists = <Selectable>(
  state: Record<any, any>,
  selector: string,
  changes: Partial<Selectable>
): { [key: string]: Selectable } | undefined =>
  state[selector] !== undefined
    ? {
        [selector]: {
          ...state[selector],
          ...changes,
        },
      }
    : undefined;

/**
 * Return the selected item if it exists, otherwise undefined
 */
export const selectIfExists = <Selectable>(state: Record<any, any>, selector: string): Selectable | undefined =>
  state[selector] !== undefined ? state[selector] : undefined;
