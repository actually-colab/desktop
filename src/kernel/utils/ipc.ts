import { ipcRenderer } from 'electron';

import { IpcKernelProcessPayload, IPC_KERNEL_PROCESS_CHANNEL } from '../../shared/types/ipc';

/**
 * Send an IPC kernel payload to the main process
 */
export const sendKernelProcessToMain = (payload: IpcKernelProcessPayload) => {
  ipcRenderer.send(IPC_KERNEL_PROCESS_CHANNEL, payload);
};
