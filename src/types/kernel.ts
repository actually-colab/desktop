import { ImmutableObject } from './immutable';

/**
 * Status of the kernel
 */
export type KERNEL_STATUS = 'Offline' | 'Connecting' | 'Reconnecting' | 'Error' | 'Busy' | 'Idle';

/**
 * A log message from interacting with the kernel
 */
export type KernelLog = {
  id: number;
  status: 'Info' | 'Success' | 'Error' | 'Warning';
  message: string;
  date: Date;
  dateString?: string;
};

export type ImmutableKernelLog = ImmutableObject<KernelLog>;
