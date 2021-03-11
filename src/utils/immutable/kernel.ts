import { ImmutableKernelLog, KernelLog } from '../../types/kernel';
import { makeImmutableObject } from './helper';

export const makeImmutableKernelLog = (kernelLog: KernelLog): ImmutableKernelLog =>
  makeImmutableObject<KernelLog, ImmutableKernelLog>(kernelLog);
