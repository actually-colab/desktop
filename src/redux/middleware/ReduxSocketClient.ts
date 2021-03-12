import { Middleware } from 'redux';
import { v4 as uuid } from 'uuid';
import { ActuallyColabSocketClient } from '@actually-colab/editor-client';

import { ReduxState } from '../../types/redux';
import { AuthActionTypes, SIGN_IN } from '../../types/redux/auth';
import { CELL, EditorActionTypes, NOTEBOOKS } from '../../types/redux/editor';
import { EXAMPLE_PROJECT } from '../../constants/demo';
import { httpToWebSocket } from '../../utils/request';
import { isCellOwner, isDemo } from '../../utils/redux';
import { _editor } from '../actions';
import { cleanDCell } from '../../utils/notebook';

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
        client.on('cell_created', (dcell) => {
          console.log('Cell created', dcell);
          store.dispatch(_editor.addCellSuccess(true, dcell.cell_id, -1, cleanDCell(dcell)));
        });
        client.on('cell_locked', (dcell) => {
          console.log('Cell locked', dcell);
          store.dispatch(
            _editor.lockCellSuccess(
              isCellOwner(store.getState(), dcell),
              dcell.lock_held_by ?? '',
              dcell.cell_id,
              cleanDCell(dcell)
            )
          );
        });
        client.on('cell_unlocked', (dcell) => {
          console.log('Cell unlocked', dcell);
          store.dispatch(
            _editor.unlockCellSuccess(
              isCellOwner(store.getState(), dcell),
              store.getState().auth.user?.uid ?? '',
              dcell.cell_id,
              cleanDCell(dcell)
            )
          );
        });
        client.on('cell_edited', (dcell) => {
          console.log('Cell edited', dcell);
          store.dispatch(
            _editor.editCellSuccess(isCellOwner(store.getState(), dcell), dcell.cell_id, cleanDCell(dcell))
          );
        });
        break;
      }

      case NOTEBOOKS.OPEN.START: {
        if (action.nb_id === EXAMPLE_PROJECT.nb_id) {
          break;
        }

        client?.openNotebook(action.nb_id);
        break;
      }
      case CELL.ADD.START: {
        if (isDemo(store.getState())) {
          const cell_id = `DEMO-${uuid()}`;
          store.dispatch(_editor.addCellSuccess(true, cell_id, action.index, { cell_id }));
          return;
        }

        client?.createCell(store.getState().editor.notebook.get('nb_id'), 'python3');
        break;
      }
      case CELL.DELETE.START: {
        if (isDemo(store.getState())) {
          store.dispatch(_editor.deleteCellSuccess(true, action.cell_id));
          return;
        }

        // TODO: delete cell
        break;
      }
      case CELL.LOCK.START: {
        if (isDemo(store.getState())) {
          store.dispatch(
            _editor.lockCellSuccess(true, store.getState().auth.user?.uid ?? '', action.cell_id, {
              lock_held_by: store.getState().auth.user?.uid ?? '',
            })
          );
          return;
        }

        client?.lockCell(store.getState().editor.notebook.get('nb_id'), action.cell_id);
        break;
      }
      case CELL.UNLOCK.START: {
        if (isDemo(store.getState())) {
          store.dispatch(
            _editor.unlockCellSuccess(true, store.getState().auth.user?.uid ?? '', action.cell_id, { lock_held_by: '' })
          );
          return;
        }

        client?.unlockCell(store.getState().editor.notebook.get('nb_id'), action.cell_id);
        break;
      }
      case CELL.EDIT.START: {
        if (isDemo(store.getState())) {
          store.dispatch(_editor.editCellSuccess(true, action.cell_id, action.changes));
          return;
        }

        // TODO: need to be able to change more than just contents
        if (action.changes.contents !== undefined) {
          client?.editCell(store.getState().editor.notebook.get('nb_id'), action.cell_id, action.changes.contents);
        }
        break;
      }
    }

    return next(action);
  };
};

export default ReduxSocketClient;
