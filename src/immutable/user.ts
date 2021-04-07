import { DUser } from '@actually-colab/editor-types';
import { Record as ImmutableRecord } from 'immutable';

import { ImmutableRecordOf } from '../types/immutable';

/**
 * An Immutable Record for a user
 */
export type ImmutableUser = ImmutableRecordOf<Required<DUser>>;
/**
 * An Immutable Record Factory for a user
 */
export const ImmutableUserFactory = ImmutableRecord<Required<DUser>>({
  uid: '',
  name: '',
  email: '',
  image_url: '',
});
