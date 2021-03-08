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
import { EditorCell, KernelOutput, Lock, Notebook, ReducedNotebook } from '../types/notebook';
import { KernelLog } from '../types/kernel';
import { BASE_CELL } from '../constants/notebook';
import { EXAMPLE_PROJECT, EXAMPLE_PROJECT_CELLS } from '../constants/demo';
import { DEFAULT_GATEWAY_URI } from '../constants/jupyter';
import { cellArrayToRecord } from '../utils/notebook';
import { selectIfExists, spreadableIfExists } from '../utils/spreadable';

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

  lockedCellId: string;
  lockedCells: Lock[];

  selectedCellId: string;
  executionCount: number;
  runningCellId: string;
  runQueue: string[];

  gatewayUri: string;
  kernel: IKernel | null;

  notebooks: Notebook[];
  notebook: ReducedNotebook;
  cells: Record<EditorCell['cell_id'], EditorCell>;
  outputs: KernelOutput[];
  logs: KernelLog[];
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
  lockedCells: [],

  selectedCellId: '',
  executionCount: 0,
  runningCellId: '',
  runQueue: [],

  gatewayUri: DEFAULT_GATEWAY_URI,
  kernel: null,

  notebooks: [EXAMPLE_PROJECT],
  notebook: {
    ...EXAMPLE_PROJECT,
    cell_ids: EXAMPLE_PROJECT_CELLS.map((cell) => cell.cell_id),
  },
  cells: cellArrayToRecord(EXAMPLE_PROJECT_CELLS),
  outputs: [],
  logs: [],
};

/**
 * The editor reducer
 */
const reducer = (state = initialState, action: EditorActionTypes): EditorState => {
  switch (action.type) {
    case KERNEL_LOG.APPEND:
      return {
        ...state,
        logs: [...state.logs, { ...action.log, id: state.logs.length }],
      };
    case KERNEL_LOG.CLEAR:
      return {
        ...state,
        logs: [],
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
        runQueue: [],
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
        notebooks: [EXAMPLE_PROJECT, ...action.notebooks],
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
        notebooks: [...state.notebooks, action.notebook],
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
        lockedCells: [
          ...state.lockedCells.filter((lock) => lock.cell_id !== action.cell_id),
          {
            uid: action.uid,
            cell_id: action.cell_id,
          },
        ],
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
        lockedCells: state.lockedCells.filter((lock) => lock.cell_id !== action.cell_id || lock.uid !== action.uid),
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
      const newCellIds = [...(state.notebook?.cell_ids ?? [])];

      newCellIds.splice(action.index === -1 ? newCellIds.length : action.index, 0, action.cell_id);

      return {
        ...state,
        isAddingCell: action.isMe ? false : state.isAddingCell,
        notebook: {
          ...state.notebook,
          cell_ids: newCellIds,
        },
        cells: {
          ...state.cells,
          [action.cell_id]: {
            ...BASE_CELL,
            cell_id: action.cell_id,
          },
        },
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
        const currentIndex = state.notebook.cell_ids.findIndex((cell_id) => cell_id === state.selectedCellId);
        const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

        if (nextIndex <= state.notebook.cell_ids.length - 1) {
          selectionChanges.selectedCellId = state.notebook.cell_ids[nextIndex];
        } else if (state.notebook.cell_ids.length > 1) {
          selectionChanges.selectedCellId = state.notebook.cell_ids[state.notebook.cell_ids.length - 2];
        } else {
          selectionChanges.selectedCellId = '';
        }
      }

      const { [action.cell_id]: deletedCell, ...restOfCells } = state.cells;

      return {
        ...state,
        ...selectionChanges,
        isDeletingCell: action.isMe ? false : state.isDeletingCell,
        lockedCellId: action.isMe ? '' : state.lockedCellId,
        lockedCells: state.lockedCells.filter((lock) => lock.cell_id !== action.cell_id),
        cells: restOfCells,
        outputs: state.outputs.filter((output) => output.cell_id !== action.cell_id),
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
        cells: {
          ...state.cells,
          ...spreadableIfExists<EditorCell>(state.cells, action.cell_id, action.changes),
        },
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
          : state.notebook.cell_ids.findIndex((cell_id) => cell_id === state.selectedCellId);
      const nextIndex = state.selectedCellId === '' ? 1 : currentIndex === -1 ? 0 : currentIndex + 1;

      if (nextIndex >= state.notebook.cell_ids.length) {
        if (state.notebook.cell_ids.length > 0) {
          return {
            ...state,
            selectedCellId: state.notebook.cell_ids[state.notebook.cell_ids.length - 1],
          };
        } else {
          return state;
        }
      }

      return {
        ...state,
        selectedCellId: state.notebook.cell_ids[nextIndex],
      };
    }
    case EXECUTE_CODE.QUEUE:
      return {
        ...state,
        runQueue: [...state.runQueue.filter((cell_id) => cell_id !== action.cell_id), action.cell_id],
      };
    case EXECUTE_CODE.START:
      return {
        ...state,
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id),
        isExecutingCode: true,
        runningCellId: action.cell_id,
        outputs: state.outputs.filter((output) => output.cell_id !== action.cell_id),
      };
    case EXECUTE_CODE.SUCCESS:
      return {
        ...state,
        isExecutingCode: false,
        runningCellId: '',
        executionCount: action.runIndex,
        cells: {
          ...state.cells,
          ...spreadableIfExists<EditorCell>(state.cells, action.cell_id, {
            runIndex:
              action.runIndex > state.executionCount
                ? action.runIndex
                : selectIfExists<EditorCell>(state.cells, action.cell_id)?.runIndex,
          }),
        },
      };
    case EXECUTE_CODE.FAILURE:
      return {
        ...state,
        isExecutingCode: false,
        runningCellId: '',
        executionCount: action.runIndex,
        cells: {
          ...state.cells,
          ...spreadableIfExists<EditorCell>(state.cells, action.cell_id, {
            runIndex:
              action.runIndex > state.executionCount
                ? action.runIndex
                : selectIfExists<EditorCell>(state.cells, action.cell_id)?.runIndex,
          }),
        },
        runQueue: [],
      };
    case KERNEL_MESSAGE.RECEIVE:
      return {
        ...state,
        outputs: [...state.outputs, ...action.messages],
      };
    case KERNEL_MESSAGE.UPDATE_RUN_INDEX:
      return {
        ...state,
        cells: {
          ...state.cells,
          ...spreadableIfExists<EditorCell>(state.cells, action.cell_id, {
            runIndex:
              action.runIndex > state.executionCount
                ? action.runIndex
                : selectIfExists<EditorCell>(state.cells, action.cell_id)?.runIndex,
          }),
        },
      };
    case EDIT_CELL.UPDATE_CODE:
      return {
        ...state,
        cells: {
          ...state.cells,
          ...spreadableIfExists<EditorCell>(state.cells, action.cell_id, {
            code: action.code,
          }),
        },
      };
    default:
      return state;
  }
};

export default reducer;
