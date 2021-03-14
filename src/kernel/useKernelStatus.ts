import React from 'react';
import { useSelector } from 'react-redux';

import { KernelStatus } from '../types/kernel';
import { ReduxState } from '../types/redux';
import { palette } from '../constants/theme';

/**
 * Hook to get the status of the local kernel
 */
const useKernelStatus = () => {
  const isConnectingToKernel = useSelector((state: ReduxState) => state.editor.isConnectingToKernel);
  const isReconnectingToKernel = useSelector((state: ReduxState) => state.editor.isReconnectingToKernel);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);

  const kernelStatus = React.useMemo<KernelStatus>(
    () =>
      isConnectingToKernel
        ? 'Connecting'
        : isReconnectingToKernel
        ? 'Reconnecting'
        : kernel === null
        ? 'Offline'
        : kernel.status,
    [isConnectingToKernel, isReconnectingToKernel, kernel]
  );

  const kernelStatusColor = React.useMemo(() => {
    switch (kernelStatus) {
      case 'Reconnecting':
      case 'Busy':
        return palette.WARNING;
      case 'Error':
        return palette.ERROR;
      case 'Idle':
        return palette.SUCCESS;
      case 'Connecting':
      case 'Offline':
      default:
        return palette.GRAY;
    }
  }, [kernelStatus]);

  const kernelIsConnected = React.useMemo(() => kernelStatus === 'Idle' || kernelStatus === 'Busy', [kernelStatus]);

  return { kernelStatus, kernelStatusColor, kernelIsConnected, kernel };
};

export default useKernelStatus;
