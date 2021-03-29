import { Record as ImmutableRecord } from 'immutable';

/**
 * Get the output type of an immutable record factory
 */
export type ImmutableRecordOf<T> = ImmutableRecord<T> & Readonly<T>;
