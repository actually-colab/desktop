import React from 'react';
import { useSelector } from 'react-redux';

import { KERNEL_STATUS } from '../types/kernel';
import { ReduxState } from '../redux';
import { palette } from '../constants/theme';

/**
 * Hook to get the status of the local kernel
 */
const useKernelStatus = () => {
  const isConnectingToKernel = useSelector((state: ReduxState) => state.editor.isConnectingToKernel);
  const isReconnectingToKernel = useSelector((state: ReduxState) => state.editor.isReconnectingToKernel);
  const isExecutingCode = useSelector((state: ReduxState) => state.editor.isExecutingCode);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);

  const kernelStatus = React.useMemo<KERNEL_STATUS>(
    () =>
      isConnectingToKernel
        ? 'Connecting'
        : isReconnectingToKernel
        ? 'Reconnecting'
        : kernel === null
        ? 'Offline'
        : isExecutingCode
        ? 'Busy'
        : 'Idle',
    [isConnectingToKernel, isExecutingCode, isReconnectingToKernel, kernel]
  );

  const statusColor = React.useMemo(() => {
    switch (kernelStatus) {
      case 'Connecting':
      case 'Reconnecting':
      case 'Busy':
        return palette.WARNING;
      case 'Error':
        return palette.ERROR;
      case 'Idle':
        return palette.SUCCESS;
      case 'Offline':
      default:
        return palette.GRAY;
    }
  }, [kernelStatus]);

  return [kernelStatus, statusColor];
};

export default useKernelStatus;
