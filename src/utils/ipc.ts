import { ipcRenderer } from 'electron';

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
