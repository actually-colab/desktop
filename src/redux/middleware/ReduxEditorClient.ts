import { Middleware } from 'redux';
import { ActuallyColabRESTClient, ActuallyColabSocketClient } from '@actually-colab/editor-client';

import { ReduxState } from '../../types/redux';
import { SIGN_IN, SIGN_OUT } from '../../types/redux/auth';
import { CELL, KERNEL, NOTEBOOKS, WORKSHOPS } from '../../types/redux/editor';
import { DEMO_NOTEBOOK_NAME } from '../../constants/demo';
import { LOG_LEVEL } from '../../constants/logging';
import { httpToWebSocket } from '../../utils/request';
import {
  cleanDCell,
  convertSendablePayloadToOutputString,
  separateEmails,
  sortOutputByMessageIndex,
} from '../../utils/notebook';
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
   * If the middleware should attempt to reconnect after a disconnect.
   *
   * Reconnect is not supported locally
   */
  let shouldReconnect: boolean = process.env.NODE_ENV !== 'development';

  /**
   * If the middleware is reconnecting to the socket client
   */
  let isReconnecting: boolean = false;

  /**
   * Attempt to close the websocket on page exit
   */
  const closeOnUnmount = () => {
    try {
      // Prevent reconnecting on disconnect since it is intentional
      shouldReconnect = false;

      // Disconnect
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
        next(action);

        (async () => {
          try {
            const res = await (action.tokenType === 'id'
              ? restClient.loginWithGoogleIdToken(action.token)
              : restClient.refreshSessionToken(action.token));

            if (LOG_LEVEL === 'verbose') {
              console.log('Signed in', res);
            }

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
        store.dispatch(_editor.connectToClientStart());

        socketClient = new ActuallyColabSocketClient(baseSocketURL, action.sessionToken);

        /**
         * The socket connection was opened
         */
        socketClient.on('connect', () => {
          console.log('Connected to AC socket');

          window.addEventListener('beforeunload', closeOnUnmount);

          store.dispatch(_editor.connectToClientSuccess());

          if (isReconnecting) {
            const notebook = store.getState().editor.notebook;

            if (notebook) {
              // Force reopen the notebook if possible
              if (LOG_LEVEL === 'verbose') {
                console.log('Reopening notebook', notebook.nb_id);
              }

              store.dispatch(_editor.openNotebook(notebook.nb_id, true));
            }

            isReconnecting = false;
          }

          // Refresh notebooks and workshops
          if (!store.getState().editor.isGettingNotebooks) {
            store.dispatch(_editor.getNotebooks());
          }

          if (!store.getState().editor.isGettingWorkshops) {
            store.dispatch(_editor.getWorkshops());
          }
        });

        /**
         * The socket connection was closed
         */
        socketClient.on('close', (event) => {
          console.log('Disconnected from AC socket', event);

          window.removeEventListener('beforeunload', closeOnUnmount);
          store.dispatch(_editor.connectToClientFailure());

          // Clean up listeners
          socketClient?.removeAllListeners();
          socketClient = null;

          if (shouldReconnect) {
            const user = store.getState().auth.user;
            const token = store.getState().auth.sessionToken;

            if (user && token) {
              isReconnecting = true;

              // Attempt to open a new socket connection
              store.dispatch(_auth.signInSuccess(user, token));
            } else {
              store.dispatch(_auth.signOut());
            }
          }
        });

        /**
         * The socket connection encountered an error
         */
        socketClient.on('error', (error) => {
          console.error(error);

          store.dispatch(
            _ui.notify({
              level: 'error',
              title: 'Error',
              message: error.message,
              duration: 5000,
            })
          );
        });

        const currentUser = action.user;

        /**
         * Received notebook contents and connected users for a given notebook
         */
        socketClient.on('notebook_contents', (activeNotebook) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Notebook contents', activeNotebook);
          }

          const { connected_users, ...notebook } = activeNotebook;
          const currentUser = store.getState().auth.user;

          // Remember the most recently opened notebook
          LatestNotebookIdStorage.set(notebook.nb_id);

          const lastNotebook = store.getState().editor.notebook;

          store.dispatch(
            _editor.openNotebookSuccess(
              notebook,
              connected_users.filter((uid) => uid !== currentUser?.uid)
            )
          );

          // Restart the kernel
          const kernel = store.getState().editor.kernel;

          if (kernel !== null && store.getState().editor.executionCount > 0 && lastNotebook?.nb_id !== notebook.nb_id) {
            // Only restart the kernel if the kernel was used and the notebook changed
            store.dispatch(_editor.restartKernel(kernel.uri, kernel));
          }
        });

        /**
         * A notebook was opened by a given user
         */
        socketClient.on('notebook_opened', (nb_id, uid, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Notebook opened', nb_id, uid, triggered_by);
          }

          if (uid !== store.getState().auth.user?.uid) {
            store.dispatch(_editor.connectToNotebook(nb_id, uid));
          }
        });

        /**
         * A notebook was closed by a given user
         */
        socketClient.on('notebook_closed', (nb_id, uid, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Notebook closed', nb_id, triggered_by);
          }

          if (nb_id === store.getState().editor.notebook?.nb_id) {
            store.dispatch(_editor.disconnectFromNotebook(uid === currentUser.uid, nb_id, uid));
          }
        });

        /**
         * A notebook was shared with given users
         */
        socketClient.on('notebook_shared', (nb_id, users, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Notebook shared', nb_id, users, triggered_by);
          }

          store.dispatch(_editor.shareNotebookSuccess(triggered_by === currentUser.uid, nb_id, users));
        });

        /**
         * A workshop was shared with given attendees and instructors
         */
        socketClient.on('workshop_shared', (ws_id, attendees, instructors, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Workshop shared', ws_id, attendees, instructors, triggered_by);
          }

          store.dispatch(
            _editor.shareWorkshopSuccess(triggered_by === currentUser.uid, ws_id, {
              attendees,
              instructors,
            })
          );
        });

        /**
         * A notebook was unshared with given users
         */
        socketClient.on('notebook_unshared', (nb_id, uids, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Notebook unshared', nb_id, uids, triggered_by);
          }

          const includedMe = uids.includes(currentUser.uid);

          // Close notebook if unshared
          if (includedMe && store.getState().editor.notebook?.nb_id === nb_id) {
            store.dispatch(_editor.disconnectFromNotebook(includedMe, nb_id, currentUser.uid));
          }

          store.dispatch(_editor.unshareNotebookSuccess(triggered_by === currentUser.uid, includedMe, nb_id, uids));
        });

        /**
         * A workshop was released to attendees
         */
        socketClient.on('workshop_started', (ws_id, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Workshop started', ws_id, triggered_by);
          }

          store.dispatch(_editor.releaseWorkshopSuccess(triggered_by === currentUser.uid, ws_id));

          // Fetch new workshops and notebooks
          store.dispatch(_editor.getWorkshops());
          store.dispatch(_editor.getNotebooks());
        });

        /**
         * A cell was created by a given user
         */
        socketClient.on('cell_created', (dcell, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Cell created', dcell, triggered_by);
          }

          store.dispatch(
            _editor.addCellSuccess(triggered_by === currentUser.uid, dcell.cell_id, -1, cleanDCell(dcell))
          );
        });

        /**
         * A cell was deleted by a given user
         */
        socketClient.on('cell_deleted', (nb_id, cell_id, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Cell deleted', nb_id, cell_id, triggered_by);
          }

          store.dispatch(_editor.deleteCellSuccess(triggered_by === currentUser.uid, nb_id, cell_id));
        });

        /**
         * A cell was locked by a given user
         */
        socketClient.on('cell_locked', (dcell, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Cell locked', dcell, triggered_by);
          }

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
          if (LOG_LEVEL === 'verbose') {
            console.log('Cell unlocked', dcell, triggered_by);
          }

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
          if (LOG_LEVEL === 'verbose') {
            console.log('Cell edited', dcell, triggered_by);
          }

          store.dispatch(_editor.editCellSuccess(triggered_by === currentUser.uid, dcell.cell_id, cleanDCell(dcell)));
        });

        /**
         * An output was received from a given user
         */
        socketClient.on('output_updated', (output, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Received outputs', output, triggered_by);
          }

          if (output.uid !== currentUser.uid) {
            store.dispatch(_editor.receiveOutputs(output));
          }
        });

        /**
         * A message was received from a user
         */
        socketClient.on('chat_message_sent', (message, triggered_by) => {
          if (LOG_LEVEL === 'verbose') {
            console.log('Received chat message', message, triggered_by);
          }

          store.dispatch(_editor.sendMessageSuccess(triggered_by === currentUser.uid, message));
        });

        next(action);
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

        next(action);
        break;
      }

      /**
       * Started fetching the user's notebooks
       */
      case NOTEBOOKS.GET.START: {
        next(action);

        (async () => {
          try {
            const notebooks = await restClient.getNotebooksForUser();

            if (LOG_LEVEL === 'verbose') {
              console.log('Received notebooks', notebooks);
            }

            store.dispatch(_editor.getNotebooksSuccess(notebooks));

            // If no notebook is open, automatically open the most recent
            if (store.getState().editor.notebook === null && !store.getState().editor.isOpeningNotebook) {
              const mostRecentNotebookId = LatestNotebookIdStorage.get();

              if (mostRecentNotebookId === null) {
                // Open demo notebook as fallback
                const demoNotebookId = notebooks.find((notebook) => notebook.name === DEMO_NOTEBOOK_NAME)?.nb_id;

                if (demoNotebookId) {
                  store.dispatch(_editor.openNotebook(demoNotebookId));
                }
              } else if (notebooks.findIndex((notebook) => notebook.nb_id === mostRecentNotebookId) !== -1) {
                store.dispatch(_editor.openNotebook(mostRecentNotebookId));
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
       * Started fetching the user's workshops
       */
      case WORKSHOPS.GET.START: {
        next(action);

        (async () => {
          try {
            const workshops = await restClient.getWorkshopsForUser();

            if (LOG_LEVEL === 'verbose') {
              console.log('Received workshops', workshops);
            }

            store.dispatch(_editor.getWorkshopsSuccess(workshops));

            // If no notebook is open, automatically open the most recent
            if (store.getState().editor.notebook === null && !store.getState().editor.isOpeningNotebook) {
              const mostRecentNotebookId = LatestNotebookIdStorage.get();

              if (
                mostRecentNotebookId &&
                workshops.findIndex((workshop) => workshop.main_notebook.nb_id === mostRecentNotebookId) !== -1
              ) {
                store.dispatch(_editor.openNotebook(mostRecentNotebookId));
              }
            }
          } catch (error) {
            console.error(error);
            console.error(error.response);

            store.dispatch(_editor.getWorkshopsFailure(error.message));
            store.dispatch(
              _ui.notify({
                level: 'error',
                title: 'Error',
                message: 'Failed to get your workshops!',
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
        next(action);

        (async () => {
          try {
            const notebook = await restClient.createNotebook(action.name, 'python', action.cells);

            if (LOG_LEVEL === 'verbose') {
              console.log('Notebook created', notebook);
            }

            store.dispatch(_editor.createNotebookSuccess(notebook));
            store.dispatch(_editor.openNotebook(notebook.nb_id));
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
       * Started creating a workshop
       */
      case WORKSHOPS.CREATE.START: {
        next(action);

        (async () => {
          try {
            const workshop = await restClient.createWorkshop(action.name, action.description, action.cells);

            if (LOG_LEVEL === 'verbose') {
              console.log('Workshop created', workshop);
            }

            store.dispatch(_editor.createWorkshopSuccess(workshop));
            store.dispatch(_editor.openNotebook(workshop.main_notebook.nb_id));
          } catch (error) {
            console.error(error);
            console.error(error.response);

            store.dispatch(_editor.createWorkshopFailure(error.message));
            store.dispatch(
              _ui.notify({
                level: 'error',
                title: 'Error',
                message: 'Failed to create your workshop!',
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
        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        const notebook = store.getState().editor.notebook;

        // Don't reopen the currently open notebook unless forced (for instance on reconnecting)
        if (notebook?.nb_id === action.nb_id && !action.force) {
          return;
        }

        next(action);

        // Close the notebook if one is already open
        if (notebook !== null) {
          if (LOG_LEVEL === 'verbose') {
            console.log('Closing notebook', notebook.nb_id);
          }

          socketClient?.closeNotebook(notebook.nb_id);
        }

        if (LOG_LEVEL === 'verbose') {
          console.log('Opening notebook', action.nb_id);
        }

        socketClient?.openNotebook(action.nb_id);
        break;
      }

      /**
       * Started sharing a given notebook
       */
      case NOTEBOOKS.SHARE.START: {
        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        const emails = separateEmails(action.emails);

        socketClient?.shareNotebook(emails, action.nb_id, action.access_level);
        break;
      }

      /**
       * Started sharing a given workshop
       */
      case WORKSHOPS.SHARE.START: {
        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        const emails = separateEmails(action.emails);

        socketClient?.shareWorkshop(emails, action.ws_id, action.access_level);
        break;
      }

      /**
       * Started unsharing a given notebook
       */
      case NOTEBOOKS.UNSHARE.START: {
        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        const emails = separateEmails(action.emails);

        socketClient?.unshareNotebook(emails, action.nb_id);
        break;
      }

      /**
       * Started releasing a given workshop
       */
      case WORKSHOPS.RELEASE.START: {
        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        socketClient?.startWorkshop(action.ws_id);
        break;
      }

      /**
       * Selected a new user to view outputs for
       */
      case NOTEBOOKS.OUTPUTS.SELECT: {
        // TODO: fetch all outputs for the user
        next(action);
        break;
      }

      /**
       * Sent a chat message to collaborators
       */
      case NOTEBOOKS.SEND_MESSAGE.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          return;
        }

        next(action);

        socketClient?.sendChatMessage(notebook.nb_id, action.message);
        break;
      }

      /**
       * Started adding a new cell
       */
      case CELL.ADD.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          return;
        }

        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        socketClient?.createCell(notebook.nb_id, 'python');
        break;
      }

      /**
       * Started deleting a cell
       */
      case CELL.DELETE.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          return;
        }

        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        socketClient?.deleteCell(notebook.nb_id, action.cell_id);
        break;
      }

      /**
       * Started locking a given cell
       */
      case CELL.LOCK.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          return;
        }

        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        const user = store.getState().auth.user;
        const lockedCells = store.getState().editor.lockedCells;

        // Unlock any owned cells
        lockedCells.forEach((lock) => {
          if (lock.uid === user?.uid) {
            store.dispatch(_editor.unlockCell(lock.cell_id));
          }
        });

        next(action);

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
          return;
        }

        const cell = store.getState().editor.cells.get(action.cell_id);
        if (cell === undefined) {
          console.error('Cell was undefined');
          return;
        }

        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        socketClient?.unlockCell(notebook.nb_id, action.cell_id, {
          language: cell.language,
          contents: cell.contents,
          cursor_col: cell.cursor_col,
          cursor_row: cell.cursor_row,
        });

        // Auto render on unlock if applicable
        if (cell.language === 'markdown' && !cell.rendered) {
          store.dispatch(
            _editor.editCell(action.cell_id, {
              metaChanges: {
                rendered: true,
              },
            })
          );
        }
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
          return;
        }

        const cell = store.getState().editor.cells.get(action.cell_id);
        if (cell === undefined) {
          console.error('Cell was undefined');
          return;
        }

        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        if (action.changes !== undefined) {
          socketClient?.editCell(notebook.nb_id, action.cell_id, {
            language: cell.language,
            contents: cell.contents,
            cursor_col: cell.cursor_col,
            cursor_row: cell.cursor_row,
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
          return;
        }

        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        // Send a blank message to notify the clients of the updated run index
        socketClient?.updateOutput(
          notebook.nb_id,
          action.cell_id,
          convertSendablePayloadToOutputString({
            metadata: {
              runIndex: action.runIndex,
              running: true,
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
          return;
        }

        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        // Get all the existing messages plus the new ones
        const allMessages =
          store
            .getState()
            .editor.outputs.get(action.cell_id)
            ?.get('')
            ?.get(action.runIndex.toString())
            ?.toArray()
            .map((message) => message.toObject())
            .sort(sortOutputByMessageIndex) ?? [];

        socketClient?.updateOutput(
          notebook.nb_id,
          action.cell_id,
          convertSendablePayloadToOutputString({
            metadata: {
              runIndex: action.runIndex,
              running: true,
            },
            messages: allMessages,
          })
        );
        break;
      }

      /**
       * Finished receiving messages from kernel
       */
      case KERNEL.EXECUTE.SUCCESS: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          return;
        }

        if (store.getState().editor.clientConnectionStatus !== 'Connected') {
          console.error('Tried to use socket before connected');
          return;
        }

        next(action);

        // Get all the existing messages plus the new ones
        const allMessages =
          store
            .getState()
            .editor.outputs.get(action.cell_id)
            ?.get('')
            ?.get(action.runIndex.toString())
            ?.toArray()
            .map((message) => message.toObject())
            .sort(sortOutputByMessageIndex) ?? [];

        socketClient?.updateOutput(
          notebook.nb_id,
          action.cell_id,
          convertSendablePayloadToOutputString({
            metadata: {
              runIndex: action.runIndex,
              running: false,
            },
            messages: allMessages,
          })
        );
        break;
      }

      default: {
        return next(action);
      }
    }
  };
};

export default ReduxEditorClient;
