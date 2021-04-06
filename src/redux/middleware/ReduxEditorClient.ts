import { Middleware } from 'redux';
import { ActuallyColabRESTClient, ActuallyColabSocketClient } from '@actually-colab/editor-client';

import { ReduxState } from '../../types/redux';
import { SIGN_IN, SIGN_OUT } from '../../types/redux/auth';
import { CELL, NOTEBOOKS } from '../../types/redux/editor';
import { DEMO_NOTEBOOK_NAME } from '../../constants/demo';
import { httpToWebSocket } from '../../utils/request';
import { cleanDCell } from '../../utils/notebook';
import { LatestNotebookIdStorage } from '../../utils/storage';
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
      /**
       * The user has started signing in
       */
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
      /**
       * The user has signed in successfully
       */
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
      /**
       * The user has signed out successfully
       */
      case SIGN_OUT.SUCCESS: {
        socketClient?.disconnectAndRemoveAllListeners();
        socketClient = null;

        // Clear most recent notebook
        LatestNotebookIdStorage.remove();
        break;
      }

      /**
       * Started fetching the user's notebooks
       */
      case NOTEBOOKS.GET.START: {
        (async () => {
          try {
            const notebooks = await restClient.getNotebooksForUser();

            store.dispatch(_editor.getNotebooksSuccess(notebooks));

            // If no notebook is open, automatically open the most recent
            if (store.getState().editor.notebook === null && !store.getState().editor.isOpeningNotebook) {
              const mostRecentNotebookId = LatestNotebookIdStorage.get();

              if (mostRecentNotebookId && notebooks.find((notebook) => notebook.nb_id === mostRecentNotebookId)) {
                store.dispatch(_editor.openNotebook(mostRecentNotebookId));
              } else {
                // Open demo notebook as fallback
                const demoNotebookId = notebooks.find((notebook) => notebook.name === DEMO_NOTEBOOK_NAME)?.nb_id;

                if (demoNotebookId) {
                  store.dispatch(_editor.openNotebook(demoNotebookId));
                }
              }
            }
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

      /**
       * Started creating a notebook
       */
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

      /**
       * Started opening a given notebook
       */
      case NOTEBOOKS.OPEN.START: {
        (async () => {
          socketClient?.openNotebook(action.nb_id);

          try {
            const notebook = await restClient.getNotebookContents(action.nb_id);

            // Remember the most recently opened notebook
            LatestNotebookIdStorage.set(notebook.nb_id);

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

      /**
       * Started sharing a given notebook
       */
      case NOTEBOOKS.SHARE.START: {
        (async () => {
          try {
            const notebook = await restClient.shareNotebook(action.email, action.nb_id, action.access_level);

            store.dispatch(_editor.shareNotebookSuccess());
          } catch (error) {
            console.error(error);
            store.dispatch(_editor.shareNotebooksFailure(error.message));
            store.dispatch(
              _ui.notify({
                level: 'error',
                title: 'Error',
                message: 'Failed to share notebook!',
                duration: 3000,
              })
            );
          }
        })();
        break;
      }

      /**
       * Started adding a new cell
       */
      case CELL.ADD.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        socketClient?.createCell(notebook.nb_id, 'python');
        break;
      }

      /**
       * Started deleting a cell
       */
      case CELL.DELETE.START: {
        // TODO: delete cell
        break;
      }

      /**
       * Started locking a given cell
       */
      case CELL.LOCK.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        socketClient?.lockCell(notebook.nb_id, action.cell_id);
        break;
      }

      /**
       * Started to unlock a cell
       */
      case CELL.UNLOCK.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        socketClient?.unlockCell(notebook.nb_id, action.cell_id);
        break;
      }

      /**
       * Started editing a cell.
       *
       * Edit request is debounced so success will be delayed
       */
      case CELL.EDIT.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        if (action.changes !== undefined) {
          socketClient?.editCell(notebook.nb_id, action.cell_id, action.changes);
        }
        break;
      }
    }

    return next(action);
  };
};

export default ReduxEditorClient;
