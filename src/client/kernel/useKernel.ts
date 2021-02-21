import { ipcRenderer, IpcRendererEvent } from 'electron';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IpcKernelProcessPayload, IPC_KERNEL_PROCESS_CHANNEL } from '../../shared/types/ipc';

import { sendKernelProcessToMain } from '../utils/ipc';
import { ReduxState } from '../redux';
import { _editor } from '../redux/actions';
import { extractGatewayUri } from './jupyter';

/**
 * Hook to connect to a kernel
 */
const useKernel = () => {
  const isConnectingToKernel = useSelector((state: ReduxState) => state.editor.isConnectingToKernel);
  const connectToKernelErrorMessage = useSelector((state: ReduxState) => state.editor.connectToKernelErrorMessage);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);
  const kernelPid = useSelector((state: ReduxState) => state.editor.kernelPid);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);

  const dispatch = useDispatch();
  const dispatchConnectToKernel = React.useCallback((uri: string) => dispatch(_editor.connectToKernel(uri)), [
    dispatch,
  ]);

  /**
   * Kernel Process IPC listener
   */
  const ipcKernelListener = React.useCallback(
    (_: IpcRendererEvent, data: IpcKernelProcessPayload) => {
      switch (data.type) {
        case 'start': {
          console.log('Received kernel process id', data);

          if ((data.pid ?? -1) !== -1) {
            // Update the kernel PID
            dispatch(_editor.kernelProcessStart(data.pid));
          }
          break;
        }
        case 'end':
          console.log('Kernel process was killed', data);

          dispatch(_editor.kernelProcessStart(-1));
          break;
        case 'stdout': {
          console.log('Received kernel process stdout', data);

          const uri = extractGatewayUri(data.message);

          if (uri) {
            console.log('Found gateway URI', uri);

            // Update the gateway uri
            dispatch(_editor.setKernelGateway(uri));
          }

          // Log the message to kernel outputs
          dispatch(_editor.kernelProcessStdout(data.message));
          break;
        }
        default:
          break;
      }
    },
    [dispatch]
  );

  /**
   * Manage the kernel process IPC listener
   */
  React.useEffect(() => {
    // Notify main that client is ready to connect
    if (kernelPid === -1) {
      console.log('Notifying main process client is ready');
      sendKernelProcessToMain({
        type: 'ready',
      });
    }

    ipcRenderer.on(IPC_KERNEL_PROCESS_CHANNEL, ipcKernelListener);

    return () => {
      ipcRenderer.removeListener(IPC_KERNEL_PROCESS_CHANNEL, ipcKernelListener);
    };
  }, [ipcKernelListener, kernelPid]);

  /**
   * Manage the kernel connection
   */
  React.useEffect(() => {
    if (
      kernelPid !== -1 &&
      gatewayUri !== '' &&
      !isConnectingToKernel &&
      connectToKernelErrorMessage === '' &&
      kernel === null
    ) {
      dispatchConnectToKernel(gatewayUri);
    }
  }, [connectToKernelErrorMessage, dispatchConnectToKernel, gatewayUri, isConnectingToKernel, kernel, kernelPid]);

  return kernel;
};

export default useKernel;
