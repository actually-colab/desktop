import { Record as ImmutableRecord } from 'immutable';

import { ImmutableRecordOf } from '../../types/immutable';
import { KernelLog } from '../../types/kernel';

export type ImmutableKernelLog = ImmutableRecordOf<KernelLog>;
export const ImmutableKernelLogFactory = ImmutableRecord<KernelLog>({
  id: -1,
  status: 'Info',
  message: '',
  date: new Date(),
  dateString: '',
});
