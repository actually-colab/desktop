/**
 * Status of the kernel
 */
export type KernelStatus = 'Offline' | 'Connecting' | 'Reconnecting' | 'Error' | 'Busy' | 'Idle';

/**
 * The core info of a kernel
 */
export type Kernel = {
  uri: string;
  id: string;
  status: KernelStatus;
};

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
