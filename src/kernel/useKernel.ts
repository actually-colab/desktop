import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ReduxState } from '../redux';
import { _editor } from '../redux/actions';

/**
 * Hook to connect to a kernel
 */
const useKernel = () => {
  const isConnectingToKernel = useSelector((state: ReduxState) => state.editor.isConnectingToKernel);
  const connectToKernelErrorMessage = useSelector((state: ReduxState) => state.editor.connectToKernelErrorMessage);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);

  const dispatch = useDispatch();
  const dispatchConnectToKernel = React.useCallback((uri: string) => dispatch(_editor.connectToKernel(uri)), [
    dispatch,
  ]);

  /**
   * Manage the kernel connection
   */
  React.useEffect(() => {
    if (gatewayUri !== '' && !isConnectingToKernel && connectToKernelErrorMessage === '' && kernel === null) {
      dispatchConnectToKernel(gatewayUri);
    }
  }, [connectToKernelErrorMessage, dispatchConnectToKernel, gatewayUri, isConnectingToKernel, kernel]);

  return kernel;
};

export default useKernel;
