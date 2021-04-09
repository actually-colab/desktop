import { Middleware } from 'redux';
import { ActuallyColabRESTClient, ActuallyColabSocketClient } from '@actually-colab/editor-client';

import { ReduxState } from '../../types/redux';
import { SIGN_IN, SIGN_OUT } from '../../types/redux/auth';
import { CELL, KERNEL, NOTEBOOKS } from '../../types/redux/editor';
import { DEMO_NOTEBOOK_NAME } from '../../constants/demo';
import { httpToWebSocket } from '../../utils/request';
import { cleanDCell, convertSendablePayloadToOutputString } from '../../utils/notebook';
import { LatestNotebookIdStorage } from '../../utils/storage';
import { syncSleep } from '../../utils/sleep';
import { ReduxActions, _auth, _editor, _ui } from '../actions';

const baseRestURL = process.env.REACT_APP_AC_API_URI ?? 'http://localhost:3000/dev';
const baseSocketURL = httpToWebSocket(process.env.REACT_APP_AC_WS_URI ?? 'http://localhost:3001/dev');

/**
 * A redux middleware for the Actually Colab REST and Socket clients
 */
const ReduxEditorClient = (): Middleware<Record<string, unknown>, ReduxState, any> => {
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
            console.error(error.response);
            store.dispatch(_auth.signInFailure(error.message));
            store.dispatch(
              _ui.notify({
                level: 'error',
                title: 'Failed to sign in',
                message: error.response?.data ?? error.message,
                duration: 4000,
              })
            );
          }
        })();
        break;
      }
      /**
       * The user has signed in successfully
       */
      case SIGN_IN.SUCCESS: {
        socketClient = new ActuallyColabSocketClient(baseSocketURL, action.sessionToken);

        /**
         * The socket connection was opened
         */
        socketClient.on('connect', () => {
          console.log('Connected to AC socket');
          window.addEventListener('beforeunload', closeOnUnmount);
        });

        /**
         * The socket connection was closed
         */
        socketClient.on('close', (event) => {
          console.log('Disconnected from AC socket', event);
          window.removeEventListener('beforeunload', closeOnUnmount);
        });

        /**
         * The socket connection encountered an error
         */
        socketClient.on('error', (error) => console.error(error));

        const currentUser = action.user;

        /**
         * Received notebook contents and connected users for a given notebook
         */
        socketClient.on('notebook_contents', (activeNotebook) => {
          console.log('Notebook contents', activeNotebook);

          const { connected_users, ...notebook } = activeNotebook;
          const currentUser = store.getState().auth.user;

          // Remember the most recently opened notebook
          LatestNotebookIdStorage.set(notebook.nb_id);

          store.dispatch(
            _editor.openNotebookSuccess(
              notebook,
              connected_users.filter((uid) => uid !== currentUser?.uid)
            )
          );

          // Restart the kernel
          const kernel = store.getState().editor.kernel;

          if (kernel !== null) {
            store.dispatch(_editor.restartKernel(kernel.uri, kernel));
          }
        });

        /**
         * A notebook was opened by a given user
         */
        socketClient.on('notebook_opened', (user) => {
          console.log('Notebook opened', user);

          if (user.uid !== store.getState().auth.user?.uid) {
            store.dispatch(_editor.connectToNotebook(user));
          }
        });

        /**
         * A notebook was closed by a given user
         */
        socketClient.on('notebook_closed', (nb_id, triggered_by) => {
          console.log('Notebook closed', nb_id, triggered_by);

          if (nb_id === store.getState().editor.notebook?.nb_id) {
            store.dispatch(_editor.disconnectFromNotebook(triggered_by ?? ''));
          }
        });

        /**
         * A cell was created by a given user
         */
        socketClient.on('cell_created', (dcell, triggered_by) => {
          console.log('Cell created', dcell);
          store.dispatch(
            _editor.addCellSuccess(triggered_by === currentUser.uid, dcell.cell_id, -1, cleanDCell(dcell))
          );
        });

        /**
         * A cell was locked by a given user
         */
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

        /**
         * A cell was unlocked by a given user
         */
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

        /**
         * A cell was edited by a given user
         */
        socketClient.on('cell_edited', (dcell, triggered_by) => {
          console.log('Cell edited', dcell);
          store.dispatch(_editor.editCellSuccess(triggered_by === currentUser.uid, dcell.cell_id, cleanDCell(dcell)));
        });

        /**
         * An output was received from a given user
         */
        socketClient.on('output_updated', (output) => {
          console.log('Received outputs', output);
          if (output.uid !== currentUser.uid) {
            store.dispatch(_editor.receiveOutputs(output));
          }
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
            console.error(error.response);
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
            console.error(error.response);
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

            store.dispatch(_editor.shareNotebookSuccess(notebook));
          } catch (error) {
            console.error(error);
            console.error(error.response);
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
       * Selected a new user to view outputs for
       */
      case NOTEBOOKS.OUTPUTS.SELECT: {
        // TODO: fetch all outputs for the user
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

        const cell = store.getState().editor.cells.get(action.cell_id);
        if (cell === undefined) {
          console.error('Cell was undefined');
          break;
        }

        socketClient?.unlockCell(notebook.nb_id, action.cell_id, {
          language: cell.language,
          contents: cell.contents,
          cursor_pos: cell.cursor_pos,
        });
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

        const cell = store.getState().editor.cells.get(action.cell_id);
        if (cell === undefined) {
          console.error('Cell was undefined');
          break;
        }

        if (action.changes !== undefined) {
          socketClient?.editCell(notebook.nb_id, action.cell_id, {
            language: cell.language,
            contents: cell.contents,
            cursor_pos: cell.cursor_pos,
            ...action.changes,
          });
        }
        break;
      }

      /**
       * Execution has started with a valid run index to notify the server
       */
      case KERNEL.MESSAGE.UPDATE_RUN_INDEX: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        // Send a blank message to notify the clients of the updated run index
        socketClient?.updateOutput(
          notebook.nb_id,
          action.cell_id,
          convertSendablePayloadToOutputString({
            metadata: {
              runIndex: action.runIndex,
            },
            messages: [],
          })
        );
        break;
      }

      /**
       * Received a message from the kernel to send to the server
       */
      case KERNEL.MESSAGE.RECEIVE: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        // Get all the existing messages plus the new ones
        const allMessages = (
          store
            .getState()
            .editor.outputs.get(action.cell_id)
            ?.get('')
            ?.filter((message) => message.runIndex === action.messages[0].runIndex)
            ?.toArray()
            ?.map((message) => message.toObject()) ?? []
        ).concat(action.messages);

        socketClient?.updateOutput(
          notebook.nb_id,
          action.cell_id,
          convertSendablePayloadToOutputString({
            metadata: {
              runIndex: action.runIndex,
            },
            messages: allMessages,
          })
        );
        break;
      }
    }

    return next(action);
  };
};

export default ReduxEditorClient;
