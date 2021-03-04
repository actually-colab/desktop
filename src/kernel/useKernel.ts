import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ReduxState } from '../redux';
import { _editor } from '../redux/actions';

/**
 * Hook to connect to a kernel
 */
const useKernel = () => {
  const autoConnectToKernel = useSelector((state: ReduxState) => state.editor.autoConnectToKernel);
  const isEditingGatewayUri = useSelector((state: ReduxState) => state.editor.isEditingGatewayUri);
  const isConnectingToKernel = useSelector((state: ReduxState) => state.editor.isConnectingToKernel);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);

  const dispatch = useDispatch();
  const dispatchConnectToKernel = React.useCallback(
    (uri: string, displayError?: boolean) => dispatch(_editor.connectToKernel(uri, displayError)),
    [dispatch]
  );
  const dispatchDisconnectFromKernel = React.useCallback(
    () => kernel !== null && dispatch(_editor.disconnectFromKernel(kernel)),
    [dispatch, kernel]
  );

  const timeout = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Manage the kernel connection
   */
  React.useEffect(() => {
    if (autoConnectToKernel && !isEditingGatewayUri && gatewayUri !== '' && !isConnectingToKernel && kernel === null) {
      const displayError = timeout.current === null;
      const delay = timeout.current === null ? 10 : 5000;

      timeout.current = setTimeout(() => dispatchConnectToKernel(gatewayUri, displayError), delay);
    }

    // Cancel timer if auto connecting is disabled
    if (!autoConnectToKernel || isEditingGatewayUri) {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
    }
  }, [autoConnectToKernel, dispatchConnectToKernel, gatewayUri, isConnectingToKernel, isEditingGatewayUri, kernel]);

  /**
   * Destroy timer on unmount
   */
  React.useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
    };
  }, []);

  /**
   * Automatically disconnect from the kernel if the gateway URI is edited
   */
  React.useEffect(() => {
    if (isEditingGatewayUri) {
      dispatchDisconnectFromKernel();
    }
  }, [dispatchDisconnectFromKernel, isEditingGatewayUri]);

  return kernel;
};

export default useKernel;
