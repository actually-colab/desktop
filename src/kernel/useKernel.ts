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
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);

  const dispatch = useDispatch();
  const dispatchConnectToKernel = React.useCallback(() => dispatch(_editor.connectToKernel()), [dispatch]);

  React.useEffect(() => {
    if (!isConnectingToKernel && connectToKernelErrorMessage === '' && kernel === null) {
      dispatchConnectToKernel();
    }
  }, [connectToKernelErrorMessage, dispatchConnectToKernel, isConnectingToKernel, kernel]);

  return kernel;
};

export default useKernel;
