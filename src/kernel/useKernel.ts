import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ReduxState } from '../types/redux';
import { _editor } from '../redux/actions';

/**
 * Hook to connect to a kernel
 */
const useKernel = (): null => {
  const user = useSelector((state: ReduxState) => state.auth.user);
  const autoConnectToKernel = useSelector((state: ReduxState) => state.editor.autoConnectToKernel);
  const isEditingGatewayUri = useSelector((state: ReduxState) => state.editor.isEditingGatewayUri);
  const isConnectingToKernel = useSelector((state: ReduxState) => state.editor.isConnectingToKernel);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);

  const shouldConnect = React.useMemo(
    () =>
      autoConnectToKernel &&
      !isEditingGatewayUri &&
      gatewayUri !== '' &&
      !isConnectingToKernel &&
      kernel === null &&
      user !== null,
    [autoConnectToKernel, gatewayUri, isConnectingToKernel, isEditingGatewayUri, kernel, user]
  );

  const dispatch = useDispatch();
  const dispatchConnectToKernel = React.useCallback(
    (uri: string, displayError?: boolean) => dispatch(_editor.connectToKernel(uri, displayError)),
    [dispatch]
  );
  const dispatchDisconnectFromKernel = React.useCallback(() => dispatch(_editor.disconnectFromKernel()), [dispatch]);

  const timeout = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Manage the kernel connection
   */
  React.useEffect(() => {
    if (shouldConnect) {
      const displayError = false; // use `timeout.current === null` to only show on the first time
      const delay = timeout.current === null ? 10 : 5000;

      timeout.current = setTimeout(() => dispatchConnectToKernel(gatewayUri, displayError), delay);
    } else {
      // Cancel timer if auto connecting is disabled
      if (!autoConnectToKernel || isEditingGatewayUri) {
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }
      }
    }
  }, [autoConnectToKernel, dispatchConnectToKernel, gatewayUri, isEditingGatewayUri, shouldConnect]);

  /**
   * Automatically disconnect from the kernel if the gateway URI is edited
   */
  React.useEffect(() => {
    if (isEditingGatewayUri) {
      dispatchDisconnectFromKernel();
    }
  }, [dispatchDisconnectFromKernel, isEditingGatewayUri]);

  /**
   * Handle unmount
   */
  React.useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
    };
  }, []);

  return null;
};

export default useKernel;
