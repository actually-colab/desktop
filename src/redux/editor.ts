import { fromJS, List as ImmutableList, Map as ImmutableMap } from 'immutable';
import { IKernel } from 'jupyter-js-services';

import {
  ADD_CELL,
  CONNECT_TO_KERNEL,
  DELETE_CELL,
  EditorActionTypes,
  EDIT_CELL,
  EXECUTE_CODE,
  KERNEL_GATEWAY,
  KERNEL_LOG,
  KERNEL_MESSAGE,
  LOCK_CELL,
  NOTEBOOKS,
  SELECT_CELL,
  UNLOCK_CELL,
} from '../types/redux/editor';
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
import { EXAMPLE_PROJECT, EXAMPLE_PROJECT_CELLS } from '../constants/demo';
import { DEFAULT_GATEWAY_URI } from '../constants/jupyter';
import { cellArrayToImmutableMap } from '../utils/notebook';

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
  notebook: ImmutableReducedNotebook;
  cells: ImmutableMap<EditorCell['cell_id'], ImmutableEditorCell>;
  outputs: ImmutableList<ImmutableKernelOutput>;
  logs: ImmutableList<ImmutableKernelLog>;
}

const initialState: EditorState = {
  autoConnectToKernel: true,
  isEditingGatewayUri: false,

  isConnectingToKernel: false,
  isReconnectingToKernel: false,
  connectToKernelErrorMessage: '',

  isGettingNotebooks: false,
  getNotebooksErrorMessage: '',
  getNotebooksTimestamp: null,

  isCreatingNotebook: false,

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

  notebooks: fromJS([EXAMPLE_PROJECT]),
  notebook: fromJS({
    ...EXAMPLE_PROJECT,
    cell_ids: EXAMPLE_PROJECT_CELLS.map((cell) => cell.cell_id),
  }),
  cells: cellArrayToImmutableMap(EXAMPLE_PROJECT_CELLS),
  outputs: ImmutableList(),
  logs: ImmutableList(),
};

/**
 * The editor reducer
 */
const reducer = (state = initialState, action: EditorActionTypes): EditorState => {
  switch (action.type) {
    case KERNEL_LOG.APPEND:
      return {
        ...state,
        logs: state.logs.push(
          fromJS({
            ...action.log,
            id: state.logs.size,
          })
        ),
      };
    case KERNEL_LOG.CLEAR:
      return {
        ...state,
        logs: state.logs.clear(),
      };
    case KERNEL_GATEWAY.SET:
      return {
        ...state,
        gatewayUri: action.uri,
      };
    case KERNEL_GATEWAY.EDIT:
      return {
        ...state,
        isEditingGatewayUri: action.editing,
      };
    case CONNECT_TO_KERNEL.AUTO:
      return {
        ...state,
        autoConnectToKernel: action.enable,
      };
    case CONNECT_TO_KERNEL.START:
      return {
        ...state,
        executionCount: 0,
        runningCellId: '',
        isConnectingToKernel: true,
        connectToKernelErrorMessage: '',
        kernel: null,
      };
    case CONNECT_TO_KERNEL.SUCCESS:
      return {
        ...state,
        isConnectingToKernel: false,
        kernel: action.kernel,
      };
    case CONNECT_TO_KERNEL.FAILURE:
      return {
        ...state,
        isConnectingToKernel: false,
        connectToKernelErrorMessage: action.error.message,
      };
    case CONNECT_TO_KERNEL.RECONNECTING:
      return {
        ...state,
        isReconnectingToKernel: true,
      };
    case CONNECT_TO_KERNEL.RECONNECTED:
      return {
        ...state,
        isReconnectingToKernel: false,
      };
    case CONNECT_TO_KERNEL.DISCONNECTED:
      return {
        ...state,
        autoConnectToKernel: action.retry,
        isConnectingToKernel: false,
        isReconnectingToKernel: false,
        isExecutingCode: false,
        runningCellId: '',
        runQueue: state.runQueue.clear(),
        kernel: null,
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
        notebooks: fromJS([EXAMPLE_PROJECT, ...action.notebooks]),
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
        notebooks: state.notebooks.push(fromJS(action.notebook)),
      };
    case NOTEBOOKS.CREATE.FAILURE:
      return {
        ...state,
        isCreatingNotebook: false,
      };
    case LOCK_CELL.START:
      return {
        ...state,
        isLockingCell: true,
      };
    case LOCK_CELL.SUCCESS:
      return {
        ...state,
        isLockingCell: action.isMe ? false : state.isLockingCell,
        lockedCellId: action.isMe ? action.cell_id : state.lockedCellId === action.cell_id ? '' : state.lockedCellId,
        lockedCells: state.lockedCells
          .filter((lock) => lock.get('cell_id') !== action.cell_id)
          .push(
            fromJS({
              uid: action.uid,
              cell_id: action.cell_id,
            })
          ),
      };
    case LOCK_CELL.FAILURE:
      return {
        ...state,
        isLockingCell: false,
      };
    case UNLOCK_CELL.START:
      return {
        ...state,
        isUnlockingCell: true,
      };
    case UNLOCK_CELL.SUCCESS:
      return {
        ...state,
        isUnlockingCell: action.isMe ? false : state.isUnlockingCell,
        lockedCellId: action.isMe ? '' : state.lockedCellId,
        lockedCells: state.lockedCells.filter(
          (lock) => lock.get('cell_id') !== action.cell_id || lock.get('uid') !== action.uid
        ),
      };
    case UNLOCK_CELL.FAILURE:
      return {
        ...state,
        isUnlockingCell: false,
      };
    case ADD_CELL.START:
      return {
        ...state,
        isAddingCell: true,
      };
    case ADD_CELL.SUCCESS: {
      return {
        ...state,
        isAddingCell: action.isMe ? false : state.isAddingCell,
        notebook: state.notebook.update('cell_ids', ImmutableList(), (cell_ids) =>
          cell_ids.splice(action.index === -1 ? state.notebook.get('cell_ids').size : action.index, 0, action.cell_id)
        ),
        cells: state.cells.set(
          action.cell_id,
          fromJS({
            ...BASE_CELL,
            cell_id: action.cell_id,
          })
        ),
      };
    }
    case ADD_CELL.FAILURE:
      return {
        ...state,
        isAddingCell: false,
      };
    case DELETE_CELL.START:
      return {
        ...state,
        isDeletingCell: true,
      };
    case DELETE_CELL.SUCCESS: {
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
        outputs: state.outputs.filter((output) => output.get('cell_id') !== action.cell_id),
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id),
      };
    }
    case DELETE_CELL.FAILURE:
      return {
        ...state,
        isDeletingCell: false,
      };
    case EDIT_CELL.START:
      return {
        ...state,
        isEditingCell: true,
      };
    case EDIT_CELL.SUCCESS: {
      const runQueueChanges: Partial<EditorState> = {};

      // If a cell in the runQueue is no longer python, it should not be executed
      if (action.changes.language === 'md') {
        if (state.runQueue.includes(action.cell_id)) {
          runQueueChanges.runQueue = state.runQueue.filter((cell_id) => cell_id !== action.cell_id);
        }
      }

      return {
        ...state,
        ...runQueueChanges,
        isEditingCell: action.isMe ? false : state.isDeletingCell,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.merge((ImmutableMap(action.changes) as unknown) as ImmutableEditorCell)
        ),
      };
    }
    case EDIT_CELL.FAILURE:
      return {
        ...state,
        isEditingCell: false,
      };
    case SELECT_CELL.SET:
      return {
        ...state,
        selectedCellId: action.cell_id,
      };
    case SELECT_CELL.NEXT: {
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
    case EXECUTE_CODE.QUEUE:
      return {
        ...state,
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id).push(action.cell_id),
      };
    case EXECUTE_CODE.START:
      return {
        ...state,
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id),
        isExecutingCode: true,
        runningCellId: action.cell_id,
        outputs: state.outputs.filter((output) => output.get('cell_id') !== action.cell_id),
      };
    case EXECUTE_CODE.SUCCESS:
      return {
        ...state,
        isExecutingCode: false,
        runningCellId: '',
        executionCount: action.runIndex,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.get('runIndex'))
        ),
      };
    case EXECUTE_CODE.FAILURE:
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
    case KERNEL_MESSAGE.RECEIVE:
      return {
        ...state,
        outputs: state.outputs.concat(
          ImmutableList<ImmutableKernelOutput>(
            action.messages.map<ImmutableKernelOutput>(
              (message) => (ImmutableMap(message) as unknown) as ImmutableKernelOutput
            )
          )
        ),
      };
    case KERNEL_MESSAGE.UPDATE_RUN_INDEX:
      return {
        ...state,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.get('runIndex'))
        ),
      };
    case EDIT_CELL.UPDATE_CODE:
      return {
        ...state,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) => value.set('code', action.code)),
      };
    default:
      return state;
  }
};

export default reducer;
