import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import { IKernel } from 'jupyter-js-services';

import { CELL, EditorActionTypes, KERNEL, NOTEBOOKS } from '../types/redux/editor';
import {
  EditorCell,
  ImmutableEditorCell,
  ImmutableKernelOutput,
  ImmutableLock,
  ImmutableNotebook,
  ImmutableReducedNotebook,
} from '../types/notebook';
import { ImmutableKernelLog } from '../types/kernel';
import { BASE_CELL, IMMUTABLE_BASE_CELL } from '../constants/notebook';
import { DEFAULT_GATEWAY_URI } from '../constants/jupyter';
import {
  cellArrayToImmutableMap,
  cleanDCell,
  reduceImmutableNotebook,
  reduceNotebookContents,
} from '../utils/notebook';
import { makeImmutableKernelLog } from '../utils/immutable/kernel';
import {
  makeImmutableEditorCell,
  makeImmutableKernelOutput,
  makeImmutableLock,
  makeImmutableNotebook,
  makeImmutableReducedNotebook,
} from '../utils/immutable/notebook';

/**
 * The editor redux state
 */
export interface EditorState {
  autoConnectToKernel: boolean;
  isEditingGatewayUri: boolean;

  isConnectingToKernel: boolean;
  isReconnectingToKernel: boolean;
  connectToKernelErrorMessage: string;

  isGettingNotebooks: boolean;
  getNotebooksErrorMessage: string;
  getNotebooksTimestamp: Date | null;
  isCreatingNotebook: boolean;
  isOpeningNotebook: boolean;
  openingNotebookId: string;

  isLockingCell: boolean;
  isUnlockingCell: boolean;
  isAddingCell: boolean;
  isDeletingCell: boolean;
  isEditingCell: boolean;
  isExecutingCode: boolean;

  lockedCellId: EditorCell['cell_id'];
  lockedCells: ImmutableList<ImmutableLock>;

  selectedCellId: EditorCell['cell_id'];
  executionCount: number;
  runningCellId: EditorCell['cell_id'];
  runQueue: ImmutableList<EditorCell['cell_id']>;

  gatewayUri: string;
  kernel: IKernel | null;

  notebooks: ImmutableList<ImmutableNotebook>;
  notebook: ImmutableReducedNotebook | null;
  cells: ImmutableMap<EditorCell['cell_id'], ImmutableEditorCell>;
  outputs: ImmutableMap<EditorCell['cell_id'], ImmutableList<ImmutableKernelOutput>>;
  logs: ImmutableList<ImmutableKernelLog>;
}

const initialState: EditorState = {
  autoConnectToKernel: process.env.REACT_APP_KERNEL_AUTO_CONNECT !== 'off',
  isEditingGatewayUri: false,

  isConnectingToKernel: false,
  isReconnectingToKernel: false,
  connectToKernelErrorMessage: '',

  isGettingNotebooks: false,
  getNotebooksErrorMessage: '',
  getNotebooksTimestamp: null,
  isCreatingNotebook: false,
  isOpeningNotebook: false,
  openingNotebookId: '',

  isLockingCell: false,
  isUnlockingCell: false,
  isAddingCell: false,
  isDeletingCell: false,
  isEditingCell: false,
  isExecutingCode: false,

  lockedCellId: '',
  lockedCells: ImmutableList(),

  selectedCellId: '',
  executionCount: 0,
  runningCellId: '',
  runQueue: ImmutableList(),

  gatewayUri: DEFAULT_GATEWAY_URI,
  kernel: null,

  notebooks: ImmutableList(),
  notebook: null,
  cells: ImmutableMap(),
  outputs: ImmutableMap(),
  logs: ImmutableList(),
};

/**
 * The editor reducer
 */
const reducer = (state = initialState, action: EditorActionTypes): EditorState => {
  switch (action.type) {
    case KERNEL.LOG.APPEND:
      return {
        ...state,
        logs: state.logs.push(
          makeImmutableKernelLog({
            ...action.log,
            id: state.logs.size,
          })
        ),
      };
    case KERNEL.LOG.CLEAR:
      return {
        ...state,
        logs: state.logs.clear(),
      };

    case KERNEL.GATEWAY.SET:
      return {
        ...state,
        gatewayUri: action.uri,
      };
    case KERNEL.GATEWAY.EDIT:
      return {
        ...state,
        isEditingGatewayUri: action.editing,
      };

    case KERNEL.CONNECT.AUTO:
      return {
        ...state,
        autoConnectToKernel: action.enable,
      };

    case KERNEL.CONNECT.START:
      return {
        ...state,
        executionCount: 0,
        runningCellId: '',
        isConnectingToKernel: true,
        connectToKernelErrorMessage: '',
        kernel: null,
      };
    case KERNEL.CONNECT.SUCCESS:
      return {
        ...state,
        isConnectingToKernel: false,
        kernel: action.kernel,
      };
    case KERNEL.CONNECT.FAILURE:
      return {
        ...state,
        isConnectingToKernel: false,
        connectToKernelErrorMessage: action.error.message,
      };

    case KERNEL.CONNECT.RECONNECTING:
      return {
        ...state,
        isReconnectingToKernel: true,
      };
    case KERNEL.CONNECT.RECONNECTED:
      return {
        ...state,
        isReconnectingToKernel: false,
      };
    case KERNEL.CONNECT.DISCONNECTED:
      return {
        ...state,
        autoConnectToKernel: action.retry,
        isConnectingToKernel: false,
        isReconnectingToKernel: false,
        isExecutingCode: false,
        executionCount: 0,
        runningCellId: '',
        runQueue: state.runQueue.clear(),
        kernel: null,
      };
    case KERNEL.CONNECT.RESTARTED:
      return {
        ...state,
        isExecutingCode: false,
        executionCount: 0,
        runningCellId: '',
        runQueue: state.runQueue.clear(),
        cells: state.cells.map((cell) => cell.set('runIndex', BASE_CELL.runIndex)),
        outputs: state.outputs.clear(),
      };

    case NOTEBOOKS.GET.START:
      return {
        ...state,
        isGettingNotebooks: true,
        getNotebooksErrorMessage: '',
      };
    case NOTEBOOKS.GET.SUCCESS:
      return {
        ...state,
        isGettingNotebooks: false,
        notebooks: ImmutableList(action.notebooks.map((notebook) => makeImmutableNotebook(notebook))),
        getNotebooksTimestamp: new Date(),
      };
    case NOTEBOOKS.GET.FAILURE:
      return {
        ...state,
        isGettingNotebooks: false,
        getNotebooksErrorMessage: action.error.message,
      };

    case NOTEBOOKS.CREATE.START:
      return {
        ...state,
        isCreatingNotebook: true,
      };
    case NOTEBOOKS.CREATE.SUCCESS:
      return {
        ...state,
        isCreatingNotebook: false,
        notebooks: state.notebooks.push(makeImmutableNotebook(action.notebook)),
      };
    case NOTEBOOKS.CREATE.FAILURE:
      return {
        ...state,
        isCreatingNotebook: false,
      };

    case NOTEBOOKS.OPEN.START:
      return {
        ...state,
        isOpeningNotebook: true,
        openingNotebookId: action.nb_id,
        notebook: reduceImmutableNotebook(
          state.notebooks.find((notebook) => notebook.get('nb_id') === action.nb_id) ?? null
        ),
      };
    case NOTEBOOKS.OPEN.SUCCESS:
      return {
        ...state,
        isOpeningNotebook: false,
        openingNotebookId: '',
        notebook: makeImmutableReducedNotebook(reduceNotebookContents(action.notebook)),
        cells: cellArrayToImmutableMap(Object.values(action.notebook.cells).map((dcell) => cleanDCell(dcell))),
      };
    case NOTEBOOKS.OPEN.FAILURE:
      return {
        ...state,
        isOpeningNotebook: false,
        openingNotebookId: '',
      };

    case CELL.LOCK.START:
      return {
        ...state,
        isLockingCell: true,
      };
    case CELL.LOCK.SUCCESS:
      return {
        ...state,
        isLockingCell: action.isMe ? false : state.isLockingCell,
        lockedCellId: action.isMe ? action.cell_id : state.lockedCellId === action.cell_id ? '' : state.lockedCellId,
        lockedCells: state.lockedCells
          .filter((lock) => lock.get('cell_id') !== action.cell_id)
          .push(
            makeImmutableLock({
              uid: action.uid,
              cell_id: action.cell_id,
            })
          ),
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (cell) =>
          cell.merge(makeImmutableEditorCell(action.cell as EditorCell))
        ),
      };
    case CELL.LOCK.FAILURE:
      return {
        ...state,
        isLockingCell: false,
      };

    case CELL.UNLOCK.START:
      return {
        ...state,
        isUnlockingCell: true,
      };
    case CELL.UNLOCK.SUCCESS:
      return {
        ...state,
        isUnlockingCell: action.isMe ? false : state.isUnlockingCell,
        lockedCellId: action.isMe ? '' : state.lockedCellId,
        lockedCells: state.lockedCells.filter(
          (lock) => lock.get('cell_id') !== action.cell_id || lock.get('uid') !== action.uid
        ),
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (cell) =>
          cell.merge(makeImmutableEditorCell(action.cell as EditorCell))
        ),
      };
    case CELL.UNLOCK.FAILURE:
      return {
        ...state,
        isUnlockingCell: false,
      };

    case CELL.ADD.START:
      return {
        ...state,
        isAddingCell: true,
      };
    case CELL.ADD.SUCCESS: {
      if (state.notebook === null) {
        console.error('Notebook was null');
        return state;
      }

      const notebook = state.notebook;

      return {
        ...state,
        isAddingCell: action.isMe ? false : state.isAddingCell,
        notebook: state.notebook.update('cell_ids', ImmutableList(), (cell_ids) =>
          cell_ids.splice(action.index === -1 ? notebook.get('cell_ids').size ?? 0 : action.index, 0, action.cell_id)
        ),
        cells: state.cells.set(action.cell_id, makeImmutableEditorCell({ ...BASE_CELL, ...action.cell })),
      };
    }
    case CELL.ADD.FAILURE:
      return {
        ...state,
        isAddingCell: false,
      };

    case CELL.DELETE.START:
      return {
        ...state,
        isDeletingCell: true,
      };
    case CELL.DELETE.SUCCESS: {
      if (state.notebook === null) {
        console.error('Notebook was null');
        return state;
      }

      const selectionChanges: Partial<EditorState> = {};

      // If the selected cell is deleted, the selected cell should become the next cell or remain the last
      if (state.selectedCellId === action.cell_id) {
        const currentIndex = state.notebook.get('cell_ids').findIndex((cell_id) => cell_id === state.selectedCellId);
        const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

        if (nextIndex <= state.notebook.get('cell_ids').size - 1) {
          selectionChanges.selectedCellId = state.notebook.get('cell_ids').get(nextIndex);
        } else if (state.notebook.get('cell_ids').size > 1) {
          selectionChanges.selectedCellId = state.notebook.get('cell_ids').get(state.notebook.get('cell_ids').size - 2);
        } else {
          selectionChanges.selectedCellId = '';
        }
      }

      return {
        ...state,
        ...selectionChanges,
        isDeletingCell: action.isMe ? false : state.isDeletingCell,
        lockedCellId: action.isMe ? '' : state.lockedCellId,
        lockedCells: state.lockedCells.filter((lock) => lock.get('cell_id') !== action.cell_id),
        cells: state.cells.delete(action.cell_id),
        outputs: state.outputs.remove(action.cell_id),
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id),
      };
    }
    case CELL.DELETE.FAILURE:
      return {
        ...state,
        isDeletingCell: false,
      };

    case CELL.EDIT.START:
      return {
        ...state,
        isEditingCell: true,
      };
    case CELL.EDIT.SUCCESS: {
      const runQueueChanges: Partial<EditorState> = {};

      // If a cell in the runQueue is no longer python, it should not be executed
      if (action.cell.language === 'markdown') {
        if (state.runQueue.includes(action.cell_id)) {
          runQueueChanges.runQueue = state.runQueue.filter((cell_id) => cell_id !== action.cell_id);
        }
      }

      return {
        ...state,
        ...runQueueChanges,
        isEditingCell: action.isMe ? false : state.isDeletingCell,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.merge(makeImmutableEditorCell(action.cell as EditorCell))
        ),
      };
    }
    case CELL.EDIT.FAILURE:
      return {
        ...state,
        isEditingCell: false,
      };
    case CELL.EDIT.UPDATE_CODE:
      return {
        ...state,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) => value.set('contents', action.code)),
      };

    case CELL.SELECT.SET:
      return {
        ...state,
        selectedCellId: action.cell_id,
      };
    case CELL.SELECT.NEXT: {
      if (state.notebook === null) {
        console.error('Notebook was null');
        return state;
      }

      const currentIndex =
        state.selectedCellId === ''
          ? -1
          : state.notebook.get('cell_ids').findIndex((cell_id) => cell_id === state.selectedCellId);
      const nextIndex = state.selectedCellId === '' ? 1 : currentIndex === -1 ? 0 : currentIndex + 1;

      if (nextIndex >= state.notebook.get('cell_ids').size) {
        if (state.notebook.get('cell_ids').size > 0) {
          return {
            ...state,
            selectedCellId: state.notebook.get('cell_ids').get(state.notebook.get('cell_ids').size - 1) ?? '',
          };
        } else {
          return state;
        }
      }

      return {
        ...state,
        selectedCellId: state.notebook.get('cell_ids').get(nextIndex) ?? '',
      };
    }

    case KERNEL.EXECUTE.QUEUE:
      return {
        ...state,
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id).push(action.cell_id),
      };
    case KERNEL.EXECUTE.START:
      return {
        ...state,
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id),
        isExecutingCode: true,
        runningCellId: action.cell_id,
        outputs: state.outputs.update(action.cell_id, ImmutableList(), (outputs) => outputs.clear()),
      };
    case KERNEL.EXECUTE.SUCCESS:
      return {
        ...state,
        isExecutingCode: false,
        runningCellId: '',
        executionCount: action.runIndex,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.get('runIndex'))
        ),
      };
    case KERNEL.EXECUTE.FAILURE:
      return {
        ...state,
        isExecutingCode: false,
        runningCellId: '',
        executionCount: action.runIndex,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.get('runIndex'))
        ),
        runQueue: state.runQueue.clear(),
      };

    case KERNEL.MESSAGE.RECEIVE:
      return {
        ...state,
        outputs: state.outputs.update(action.cell_id, ImmutableList(), (outputs) =>
          outputs.concat(
            ImmutableList<ImmutableKernelOutput>(
              action.messages.map<ImmutableKernelOutput>((message) => makeImmutableKernelOutput(message))
            )
          )
        ),
      };
    case KERNEL.MESSAGE.UPDATE_RUN_INDEX:
      return {
        ...state,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.get('runIndex'))
        ),
      };
    default:
      return state;
  }
};

export default reducer;
