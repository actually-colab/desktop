import { ipcRenderer } from 'electron';

import { IpcKernelProcessPayload, IPC_KERNEL_PROCESS_CHANNEL } from '../../shared/types/ipc';

/**
 * Send an IPC message to display a message
 */
export const displayMessage = (message: string) => {
  ipcRenderer.send('display-dialog', {
    type: 'message',
    message,
  });
};

/**
 * Send an IPC message to display an error
 */
export const displayError = (errorMessage: string) => {
  ipcRenderer.send('display-dialog', {
    type: 'error',
    errorMessage,
  });
};

/**
 * Send an IPC kernel payload to the main process
 */
export const sendKernelProcessToMain = (payload: IpcKernelProcessPayload) => {
  ipcRenderer.send(IPC_KERNEL_PROCESS_CHANNEL, payload);
};
