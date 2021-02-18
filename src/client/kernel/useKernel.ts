import { ipcRenderer, IpcRendererEvent } from 'electron';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IpcKernelProcessPayload, IPC_KERNEL_PROCESS_CHANNEL } from '../../shared/types/ipc';

import { sendKernelProcessToMain } from '../utils/ipc';
import { ReduxState } from '../redux';
import { _editor } from '../redux/actions';

/**
 * Hook to connect to a kernel
 */
const useKernel = () => {
  const isConnectingToKernel = useSelector((state: ReduxState) => state.editor.isConnectingToKernel);
  const connectToKernelErrorMessage = useSelector((state: ReduxState) => state.editor.connectToKernelErrorMessage);
  const kernelPid = useSelector((state: ReduxState) => state.editor.kernelPid);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);

  const dispatch = useDispatch();
  const dispatchKernelProcessStart = React.useCallback((pid: number) => dispatch(_editor.kernelProcessStart(pid)), [
    dispatch,
  ]);
  const dispatchConnectToKernel = React.useCallback(() => dispatch(_editor.connectToKernel()), [dispatch]);

  React.useEffect(() => {
    // Notify main that client is ready to connect
    if (kernelPid === -1) {
      console.log('Notifying main process client is ready');
      sendKernelProcessToMain({
        type: 'ready',
      });
    }

    const listener = (_: IpcRendererEvent, data: IpcKernelProcessPayload) => {
      switch (data.type) {
        case 'start':
          console.log('Received kernel process id', data);

          if ((data.pid ?? -1) !== -1) {
            dispatchKernelProcessStart(data.pid);
          }
          break;
        case 'end':
          console.log('Kernel process was killed', data);

          dispatchKernelProcessStart(-1);
          break;
        case 'stdout':
          console.log('Received kernel process stdout', data);
          break;
        default:
          break;
      }
    };

    ipcRenderer.on(IPC_KERNEL_PROCESS_CHANNEL, listener);

    return () => {
      ipcRenderer.removeListener(IPC_KERNEL_PROCESS_CHANNEL, listener);
    };
  }, [dispatchConnectToKernel, dispatchKernelProcessStart, kernelPid]);

  React.useEffect(() => {
    if (kernelPid !== -1 && !isConnectingToKernel && connectToKernelErrorMessage === '' && kernel === null) {
      setTimeout(() => dispatchConnectToKernel(), 1000);
    }
  }, [connectToKernelErrorMessage, dispatchConnectToKernel, isConnectingToKernel, kernel, kernelPid]);

  return kernel;
};

export default useKernel;
