import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ReduxState } from '../types/redux';
import { _editor } from '../redux/actions';

/**
 * Hook to connect to a kernel
 */
const useKernel = (): null => {
  const user = useSelector((state: ReduxState) => state.auth.user);
  const autoConnectToKernel = useSelector((state: ReduxState) => state.editor.autoConnectToKernel);
  const isEditingGateway = useSelector((state: ReduxState) => state.editor.isEditingGateway);
  const isConnectingToKernel = useSelector((state: ReduxState) => state.editor.isConnectingToKernel);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);
  const gatewayToken = useSelector((state: ReduxState) => state.editor.gatewayToken);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);

  const shouldConnect = React.useMemo(
    () =>
      autoConnectToKernel &&
      !isEditingGateway &&
      gatewayUri !== '' &&
      gatewayToken !== '' &&
      !isConnectingToKernel &&
      kernel === null &&
      user !== null,
    [autoConnectToKernel, gatewayToken, gatewayUri, isConnectingToKernel, isEditingGateway, kernel, user]
  );

  const dispatch = useDispatch();
  const dispatchConnectToKernel = React.useCallback(
    (uri: string, token: string, displayError?: boolean) => dispatch(_editor.connectToKernel(uri, token, displayError)),
    [dispatch]
  );
  const dispatchDisconnectFromKernel = React.useCallback(() => dispatch(_editor.disconnectFromKernel()), [dispatch]);

  const timeout = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Manage the kernel connection
   */
  React.useEffect(() => {
    if (shouldConnect) {
      const displayError = timeout.current === null;
      const delay = timeout.current === null ? 10 : 5000;

      timeout.current = setTimeout(() => dispatchConnectToKernel(gatewayUri, gatewayToken, displayError), delay);
    } else {
      // Cancel timer if auto connecting is disabled
      if (!autoConnectToKernel || isEditingGateway) {
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }
      }
    }
  }, [autoConnectToKernel, dispatchConnectToKernel, gatewayToken, gatewayUri, isEditingGateway, shouldConnect]);

  /**
   * Automatically disconnect from the kernel if the gateway URI is edited
   */
  React.useEffect(() => {
    if (isEditingGateway) {
      dispatchDisconnectFromKernel();
    }
  }, [dispatchDisconnectFromKernel, isEditingGateway]);

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
