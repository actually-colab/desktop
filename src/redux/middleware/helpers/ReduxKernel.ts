import { MiddlewareAPI } from 'redux';

import { ReduxState } from '../../../types/redux';
import { LOG_LEVEL } from '../../../constants/logging';
import { _editor } from '../../actions';
import { kernel, kernelManager } from '../ReduxKernel';

/**
 * Only connect if auto connect is enabled and there is no kernel connected or connecting
 */
export const connectToKernelIfReady = (store: MiddlewareAPI<any, ReduxState>, displayError = false): void => {
  if (LOG_LEVEL === 'verbose') {
    console.log('Checking if ready to connect to kernel');
  }

  if (
    kernelManager === null &&
    kernel === null &&
    store.getState().auth.user !== null &&
    store.getState().editor.gatewayUri !== '' &&
    store.getState().editor.gatewayToken !== '' &&
    !store.getState().editor.isEditingGateway &&
    !store.getState().editor.isConnectingToKernel
  ) {
    store.dispatch(
      _editor.connectToKernel(store.getState().editor.gatewayUri, store.getState().editor.gatewayToken, displayError)
    );
  } else {
    if (LOG_LEVEL === 'verbose') {
      console.log(
        'Reason for skipping connection:',
        kernelManager === null,
        kernel === null,
        store.getState().auth.user !== null,
        store.getState().editor.gatewayUri !== '',
        store.getState().editor.gatewayToken !== '',
        !store.getState().editor.isEditingGateway,
        !store.getState().editor.isConnectingToKernel
      );
    }
  }
};
