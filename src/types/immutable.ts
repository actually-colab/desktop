import { Map, Record as ImmutableRecord } from 'immutable';

/**
 * Get the output type of an immutable record factory
 */
export type ImmutableRecordOf<T> = ImmutableRecord<T> & Readonly<T>;

/**
 * Overridden ImmutableMap type that includes undefined in the updater
 */
export interface ImmutableMapOf<K, V> extends Omit<Map<K, V>, 'update'> {
  update(key: K, notSetValue: V, updater: (value: V) => V): this;
  update(key: K, updater: (value: V | undefined) => V | undefined): this;
  update<R>(updater: (value: this) => R): R;
}
