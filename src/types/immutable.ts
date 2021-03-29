import { Map as ImmutableMap } from 'immutable';

import { ValueOf } from './generics';

/**
 * An ImmutableMap override that is aware of your object properties.
 *
 * Note: if you need an immutable inside an immutable, you must define that on your type.
 */
export interface ImmutableObject<T>
  extends Omit<ImmutableMap<string, any>, 'get' | 'set' | 'update' | 'merge' | 'toJS'> {
  get<K extends keyof T>(key: K): ValueOf<Pick<T, K>>;
  set<K extends keyof T>(key: K, value: ValueOf<Pick<T, K>>): ImmutableObject<T>;
  update<K extends keyof T>(key: K, updater: (value: ValueOf<Pick<T, K>>) => ValueOf<Pick<T, K>>): ImmutableObject<T>;
  update<K extends keyof T>(
    key: K,
    noKeyValue: ValueOf<Pick<T, K>>,
    updater: (value: ValueOf<Pick<T, K>>) => ValueOf<Pick<T, K>>
  ): ImmutableObject<T>;
  merge(entries: this): this;
  toJS(): T;
}
