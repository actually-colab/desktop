import { Middleware } from 'redux';
import { ActuallyColabSocketClient } from '@actually-colab/editor-client';

import { ReduxState } from '../../types/redux';
import { AuthActionTypes, SIGN_IN } from '../../types/redux/auth';
import { EditorActionTypes, NOTEBOOKS } from '../../types/redux/editor';
import { httpToWebSocket } from '../../utils/request';

const baseURL = httpToWebSocket(process.env.REACT_APP_AC_API_URI ?? 'http://localhost:3001/dev');

/**
 * A redux middleware for the Actually Colab socket client
 */
const ReduxSocketClient = (): Middleware<{}, ReduxState> => {
  let client: ActuallyColabSocketClient | null = null;

  return (store) => (next) => (action: AuthActionTypes | EditorActionTypes) => {
    switch (action.type) {
      case SIGN_IN.SUCCESS: {
        client = new ActuallyColabSocketClient({
          baseURL,
          sessionToken: action.token,
        });

        client.on('connect', () => console.log('Connected to AC socket'));
        client.on('close', (event) => console.log('Disconnected from AC socket', event));
        client.on('error', (error) => console.error(error));
        client.on('notebook_opened', (user) => console.log('Notebook opened by', user));
        break;
      }
      case NOTEBOOKS.OPEN.START: {
        console.log('Opening notebook');
        client?.openNotebook(action.nb_id);
        break;
      }
    }

    return next(action);
  };
};

export default ReduxSocketClient;
