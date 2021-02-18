import React from 'react';
import { useSelector } from 'react-redux';

import { ReduxState } from '../redux';

/**
 * Hook to get the status of the local kernel
 */
const useKernelStatus = () => {
  const isConnectingToKernel = useSelector((state: ReduxState) => state.editor.isConnectingToKernel);
  const isExecutingCode = useSelector((state: ReduxState) => state.editor.isExecutingCode);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);

  const kernelStatus = React.useMemo<'Offline' | 'Error' | 'Busy' | 'Idle'>(
    () => (isConnectingToKernel ? 'Busy' : kernel === null ? 'Offline' : isExecutingCode ? 'Busy' : 'Idle'),
    [isConnectingToKernel, isExecutingCode, kernel]
  );

  return kernelStatus;
};

export default useKernelStatus;
