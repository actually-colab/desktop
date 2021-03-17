import { Middleware } from 'redux';
import { ActuallyColabSocketClient } from '@actually-colab/editor-client';

import { ReduxState } from '../../types/redux';
import { SIGN_IN } from '../../types/redux/auth';
import { CELL, NOTEBOOKS } from '../../types/redux/editor';
import { httpToWebSocket } from '../../utils/request';
import { cleanDCell } from '../../utils/notebook';
import { ReduxActions, _editor } from '../actions';

const baseURL = httpToWebSocket(process.env.REACT_APP_AC_WS_URI ?? 'http://localhost:3001/dev');

/**
 * A redux middleware for the Actually Colab socket client
 */
const ReduxSocketClient = (): Middleware<{}, ReduxState, any> => {
  let client: ActuallyColabSocketClient | null = null;

  return (store) => (next) => (action: ReduxActions) => {
    switch (action.type) {
      case SIGN_IN.SUCCESS: {
        client = new ActuallyColabSocketClient({
          baseURL,
          sessionToken: action.token,
        });

        client.on('connect', () => console.log('Connected to AC socket'));
        client.on('close', (event) => console.log('Disconnected from AC socket', event));
        client.on('error', (error) => console.error(error));

        const currentUser = action.user;

        client.on('notebook_opened', (user) => console.log('Notebook opened by', user));

        client.on('cell_created', (dcell, triggered_by) => {
          console.log('Cell created', dcell);
          store.dispatch(
            _editor.addCellSuccess(triggered_by === currentUser.uid, dcell.cell_id, -1, cleanDCell(dcell))
          );
        });

        client.on('cell_locked', (dcell, triggered_by) => {
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

        client.on('cell_unlocked', (dcell, triggered_by) => {
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

        client.on('cell_edited', (dcell, triggered_by) => {
          console.log('Cell edited', dcell);
          store.dispatch(_editor.editCellSuccess(triggered_by === currentUser.uid, dcell.cell_id, cleanDCell(dcell)));
        });
        break;
      }

      case NOTEBOOKS.OPEN.START: {
        client?.openNotebook(action.nb_id);
        break;
      }
      case CELL.ADD.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        client?.createCell(notebook.get('nb_id'), 'python');
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

        client?.lockCell(notebook.get('nb_id'), action.cell_id);
        break;
      }
      case CELL.UNLOCK.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        client?.unlockCell(notebook.get('nb_id'), action.cell_id);
        break;
      }
      case CELL.EDIT.START: {
        const notebook = store.getState().editor.notebook;
        if (notebook === null) {
          console.error('Notebook was null');
          break;
        }

        // TODO: need to be able to change more than just contents
        if (action.changes.contents !== undefined) {
          client?.editCell(notebook.get('nb_id'), action.cell_id, action.changes.contents);
        }
        break;
      }
    }

    return next(action);
  };
};

export default ReduxSocketClient;
