import { Record as ImmutableRecord } from 'immutable';

import { ImmutableRecordOf } from '../types/immutable';
import { KernelLog } from '../types/kernel';

/**
 * An Immutable Record for a kernel log
 */
export type ImmutableKernelLog = ImmutableRecordOf<Required<KernelLog>>;
/**
 * An Immutable Record Factory for a kernel log
 */
export const ImmutableKernelLogFactory = ImmutableRecord<Required<KernelLog>>({
  id: -1,
  status: 'Info',
  message: '',
  date: new Date(),
  dateString: '',
});
