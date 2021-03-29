import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Notebook } from '@actually-colab/editor-types';

import { ReduxState } from '../types/redux';
import { _editor } from '../redux/actions';
import { ImmutableEditorCell } from '../types/notebook';

/**
 * Hook to connect to a kernel
 */
const useKernel = () => {
  const user = useSelector((state: ReduxState) => state.auth.user);
  const autoConnectToKernel = useSelector((state: ReduxState) => state.editor.autoConnectToKernel);
  const isEditingGatewayUri = useSelector((state: ReduxState) => state.editor.isEditingGatewayUri);
  const isConnectingToKernel = useSelector((state: ReduxState) => state.editor.isConnectingToKernel);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);
  const cells = useSelector((state: ReduxState) => state.editor.cells);
  const runQueue = useSelector((state: ReduxState) => state.editor.runQueue);
  const isExecutingCode = useSelector((state: ReduxState) => state.editor.isExecutingCode);
  const notebook = useSelector((state: ReduxState) => state.editor.notebook);

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
  const dispatchExecuteCode = React.useCallback((cell: ImmutableEditorCell) => dispatch(_editor.executeCode(cell)), [
    dispatch,
  ]);
  const dispatchDisconnectFromKernel = React.useCallback(() => dispatch(_editor.disconnectFromKernel()), [dispatch]);
  const dispatchRestartKernel = React.useCallback(
    () => kernel !== null && dispatch(_editor.restartKernel(gatewayUri, kernel)),
    [dispatch, gatewayUri, kernel]
  );

  const timeout = React.useRef<NodeJS.Timeout | null>(null);
  const currentNotebookId = React.useRef<Notebook['nb_id']>('');

  /**
   * Manage the kernel connection
   */
  React.useEffect(() => {
    if (shouldConnect) {
      const displayError = timeout.current === null;
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
   * Automatically execute code from the queue
   */
  React.useEffect(() => {
    if (!isExecutingCode && runQueue.size > 0) {
      const cell = cells.get(runQueue.get(0) ?? '');

      if (cell) {
        dispatchExecuteCode(cell);
      }
    }
  }, [cells, dispatchExecuteCode, isExecutingCode, runQueue]);

  /**
   * Automatically restart kernel on notebook change
   */
  React.useEffect(() => {
    if (currentNotebookId.current !== '' && notebook !== null && notebook.get('nb_id') !== currentNotebookId.current) {
      dispatchRestartKernel();
      currentNotebookId.current = notebook.get('nb_id');
    }
  }, [dispatchRestartKernel, notebook]);

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
