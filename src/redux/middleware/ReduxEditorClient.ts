import { Middleware } from 'redux';
import { ActuallyColabRESTClient, ActuallyColabSocketClient } from '@actually-colab/editor-client';

import { ReduxState } from '../../types/redux';
import { SIGN_IN, SIGN_OUT } from '../../types/redux/auth';
import { CELL, NOTEBOOKS } from '../../types/redux/editor';
import { httpToWebSocket } from '../../utils/request';
import { cleanDCell } from '../../utils/notebook';
import { syncSleep } from '../../utils/sleep';
import { ReduxActions, _auth, _editor, _ui } from '../actions';

const baseRestURL = process.env.REACT_APP_AC_API_URI ?? 'http://localhost:3000/dev';
const baseSocketURL = httpToWebSocket(process.env.REACT_APP_AC_WS_URI ?? 'http://localhost:3001/dev');

/**
 * A redux middleware for the Actually Colab REST and Socket clients
 */
const ReduxEditorClient = (): Middleware<{}, ReduxState, any> => {
  const restClient: ActuallyColabRESTClient = new ActuallyColabRESTClient(baseRestURL);
  let socketClient: ActuallyColabSocketClient | null = null;

  /**
   * Attempt to close the websocket on page exit
   */
  const closeOnUnmount = () => {
    try {
      socketClient?.disconnectAndRemoveAllListeners();
      syncSleep(250);
    } catch (error) {}
  };

  return (store) => (next) => (action: ReduxActions) => {
    switch (action.type) {
      case SIGN_IN.START: {
        (async () => {
          try {
            const res = await (action.tokenType === 'id'
              ? restClient.loginWithGoogleIdToken(action.token)
              : restClient.refreshSessionToken(action.token));

            console.log('Signed in', res);
            store.dispatch(_auth.signInSuccess(res.user, res.sessionToken));
          } catch (error) {
            console.error(error);
            store.dispatch(_auth.signInFailure(error.message));
          }
        })();
        break;
      }
      case SIGN_IN.SUCCESS: {
        socketClient = new ActuallyColabSocketClient(baseSocketURL, action.sessionToken);

        socketClient.on('connect', () => {
          console.log('Connected to AC socket');
          window.addEventListener('beforeunload', closeOnUnmount);
        });

        socketClient.on('close', (event) => {
          console.log('Disconnected from AC socket', event);
          window.removeEventListener('beforeunload', closeOnUnmount);
        });

        socketClient.on('error', (error) => console.error(error));

        const currentUser = action.user;

        socketClient.on('notebook_opened', (user) => console.log('Notebook opened by', user));

        socketClient.on('cell_created', (dcell, triggered_by) => {
          console.log('Cell created', dcell);
          store.dispatch(
            _editor.addCellSuccess(triggered_by === currentUser.uid, dcell.cell_id, -1, cleanDCell(dcell))
          );
        });

        socketClient.on('cell_locked', (dcell, triggered_by) => {
          console.log('Cell locked', dcell);
          store.dispatch(
            _editor.lockCellSuccess(
              triggered_by === currentUser.uid,
              dcell.lock_held_by ?? '',
              dcell.cell_id,
              cleanDCell(dcell)
            )
          );
        });

        socketClient.on('cell_unlocked', (dcell, triggered_by) => {
          console.log('Cell unlocked', dcell);
          store.dispatch(
            _editor.unlockCellSuccess(
              triggered_by === currentUser.uid,
              triggered_by ?? '',
              dcell.cell_id,
              cleanDCell(dcell)
            )
          );
        });

        socketClient.on('cell_edited', (dcell, triggered_by) => {
          console.log('Cell edited', dcell);
          store.dispatch(_editor.editCellSuccess(triggered_by === currentUser.uid, dcell.cell_id, cleanDCell(dcell)));
        });
        break;
      }
      case SIGN_OUT.SUCCESS: {
        socketClient?.disconnectAndRemoveAllListeners();
        socketClient = null;
        break;
      }

      case NOTEBOOKS.GET.START: {
        (async () => {
          try {
            const notebooks = await restClient.getNotebooksForUser();

            store.dispatch(_editor.getNotebooksSuccess(notebooks));
          } catch (error) {
            console.error(error);
            store.dispatch(_editor.getNotebooksFailure(error.message));
            store.dispatch(
              _ui.notify({
                level: 'error',
                title: 'Error',
                message: 'Failed to get your notebooks!',
                duration: 3000,
              })
            );
          }
        })();
        break;
      }

      case NOTEBOOKS.CREATE.START: {
        (async () => {
          try {
            const notebook = await restClient.createNotebook(action.name);

            store.dispatch(_editor.createNotebookSuccess(notebook));
          } catch (error) {
            console.error(error);
            store.dispatch(_editor.createNotebookFailure(error.message));
            store.dispatch(
              _ui.notify({
                level: 'error',
                title: 'Error',
                message: 'Failed to create your notebook!',
                duration: 3000,
              })
            );
          }
        })();
        break;
      }

      case NOTEBOOKS.OPEN.START: {
        (async () => {
          socketClient?.openNotebook(action.nb_id);

          try {
            const notebook = await restClient.getNotebookContents(action.nb_id);

            store.dispatch(_editor.openNotebookSuccess(notebook));
          } catch (error) {
            console.error(error);
            store.dispatch(_editor.openNotebookFailure(error.message));
            store.dispatch(
              _ui.notify({
                level: 'error',
                title: 'Error',
                message: 'Failed to open your notebook!',
                duration: 3000,
              })
            );
          }
        })();
        break;
      }

      case CELL.ADD.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        socketClient?.createCell(notebook.get('nb_id'), 'python');
        break;
      }

      case CELL.DELETE.START: {
        // TODO: delete cell
        break;
      }

      case CELL.LOCK.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        socketClient?.lockCell(notebook.get('nb_id'), action.cell_id);
        break;
      }

      case CELL.UNLOCK.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        socketClient?.unlockCell(notebook.get('nb_id'), action.cell_id);
        break;
      }

      case CELL.EDIT.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        // TODO: need to be able to change more than just contents
        if (action.changes?.contents !== undefined) {
          socketClient?.editCell(notebook.get('nb_id'), action.cell_id, action.changes.contents);
        }
        break;
      }
    }

    return next(action);
  };
};

export default ReduxEditorClient;
