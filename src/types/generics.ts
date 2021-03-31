/**
 * Get the value of a type in an object. Usually used with `Pick<T, K>`
 */
export type ValueOf<T> = T[keyof T];

/**
 * Get a type with the index signature removed
 */
export type RemoveIndex<T> = {
  [P in keyof T as string extends P ? never : number extends P ? never : P]: T[P];
};
