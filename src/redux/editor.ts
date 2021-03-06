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
  SELECT_CELL,
  UNLOCK_CELL,
} from '../types/redux/editor';
import { EditorCell, KernelOutput, Lock, ReducedNotebook } from '../types/notebook';
import { KernelLog } from '../types/kernel';
import { BASE_CELL } from '../constants/notebook';
import { exampleProject } from '../constants/demo';
import { DEFAULT_GATEWAY_URI } from '../constants/jupyter';

/**
 * The editor redux state
 */
export interface EditorState {
  autoConnectToKernel: boolean;
  isEditingGatewayUri: boolean;

  isConnectingToKernel: boolean;
  isReconnectingToKernel: boolean;
  connectToKernelErrorMessage: string;

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

  projects: ReducedNotebook[];
  project: ReducedNotebook | null;
  cells: EditorCell[];
  outputs: KernelOutput[];
  logs: KernelLog[];
}

const initialState: EditorState = {
  autoConnectToKernel: true,
  isEditingGatewayUri: false,

  isConnectingToKernel: false,
  isReconnectingToKernel: false,
  connectToKernelErrorMessage: '',

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

  projects: [
    {
      nb_id: 0,
      name: 'Example Project',
      users: [],
      access_level: 'Full Access',
      cell_ids: [],
    },
  ],
  project: null,
  cells: exampleProject.cells,
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
      const newCells = [...state.cells];

      newCells.splice(action.index === -1 ? newCells.length : action.index, 0, {
        ...BASE_CELL,
        cell_id: action.cell_id,
      });

      return {
        ...state,
        isAddingCell: action.isMe ? false : state.isAddingCell,
        cells: newCells,
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

      if (state.selectedCellId === action.cell_id) {
        const currentIndex = state.cells.findIndex((cell) => cell.cell_id === state.selectedCellId);
        const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

        if (nextIndex <= state.cells.length - 1) {
          selectionChanges.selectedCellId = state.cells[nextIndex].cell_id;
        } else if (state.cells.length > 1) {
          selectionChanges.selectedCellId = state.cells[state.cells.length - 2].cell_id;
        } else {
          selectionChanges.selectedCellId = '';
        }
      }

      return {
        ...state,
        isDeletingCell: action.isMe ? false : state.isDeletingCell,
        lockedCellId: action.isMe ? '' : state.lockedCellId,
        lockedCells: state.lockedCells.filter((lock) => lock.cell_id !== action.cell_id),
        cells: state.cells.filter((cell) => cell.cell_id !== action.cell_id),
        outputs: state.outputs.filter((output) => output.cell_id !== action.cell_id),
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id),
        ...selectionChanges,
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
    case EDIT_CELL.SUCCESS:
      return {
        ...state,
        isEditingCell: action.isMe ? false : state.isDeletingCell,
        cells: state.cells.map<EditorCell>((cell) =>
          cell.cell_id === action.cell_id
            ? {
                ...cell,
                ...action.changes,
              }
            : cell
        ),
      };
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
        state.selectedCellId === '' ? -1 : state.cells.findIndex((cell) => cell.cell_id === state.selectedCellId);
      const nextIndex = state.selectedCellId === '' ? 1 : currentIndex === -1 ? 0 : currentIndex + 1;

      if (nextIndex >= state.cells.length) {
        if (state.cells.length > 0) {
          return {
            ...state,
            selectedCellId: state.cells[state.cells.length - 1].cell_id,
          };
        } else {
          return state;
        }
      }

      return {
        ...state,
        selectedCellId: state.cells[nextIndex].cell_id,
      };
    }
    case EXECUTE_CODE.QUEUE:
      return {
        ...state,
        runQueue: [...state.runQueue, action.cell_id],
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
        cells: state.cells.map<EditorCell>((cell) =>
          cell.cell_id === action.cell_id
            ? {
                ...cell,
                runIndex: action.runIndex > state.executionCount ? action.runIndex : cell.runIndex,
              }
            : cell
        ),
      };
    case EXECUTE_CODE.FAILURE:
      return {
        ...state,
        isExecutingCode: false,
        runningCellId: '',
        executionCount: action.runIndex,
        cells: state.cells.map<EditorCell>((cell) =>
          cell.cell_id === action.cell_id
            ? {
                ...cell,
                runIndex: action.runIndex > state.executionCount ? action.runIndex : cell.runIndex,
              }
            : cell
        ),
        runQueue: [],
      };
    case KERNEL_MESSAGE.RECEIVE:
      return {
        ...state,
        outputs: [...state.outputs, action.message],
      };
    case KERNEL_MESSAGE.UPDATE_RUN_INDEX:
      return {
        ...state,
        cells: state.cells.map<EditorCell>((cell) =>
          cell.cell_id === action.cell_id
            ? {
                ...cell,
                runIndex: action.runIndex > state.executionCount ? action.runIndex : cell.runIndex,
              }
            : cell
        ),
      };
    case EDIT_CELL.UPDATE_CODE:
      return {
        ...state,
        cells: state.cells.map<EditorCell>((cell) =>
          cell.cell_id === action.cell_id
            ? {
                ...cell,
                code: action.code,
              }
            : cell
        ),
      };
    default:
      return state;
  }
};

export default reducer;
