import { IKernel } from 'jupyter-js-services';

import {
  ADD_CELL,
  CONNECT_TO_KERNEL,
  DELETE_CELL,
  EditorActionTypes,
  EDIT_CELL,
  EXECUTE_CODE,
  KERNEL_GATEWAY,
  KERNEL_MESSAGE,
  LOCK_CELL,
  UNLOCK_CELL,
} from '../types/redux/editor';
import { EditorCell, KernelOutput, Lock, ReducedNotebook } from '../types/notebook';
import { BASE_CELL } from '../constants/notebook';
import { exampleProject } from '../constants/demo';
import { DEFAULT_GATEWAY_URI } from '../constants/jupyter';

/**
 * The editor redux state
 */
export interface EditorState {
  isConnectingToKernel: boolean;
  connectToKernelErrorMessage: string;

  isLockingCell: boolean;
  isUnlockingCell: boolean;
  isAddingCell: boolean;
  isDeletingCell: boolean;
  isEditingCell: boolean;

  isExecutingCode: boolean;
  executeCodeErrorMessage: string;

  lockedCellId: string;
  lockedCells: Lock[];

  executionCount: number;
  runningCellId: string;

  gatewayUri: string;
  kernel: IKernel | null;

  projects: ReducedNotebook[];
  project: ReducedNotebook | null;
  cells: EditorCell[];
  outputs: KernelOutput[];
}

const initialState: EditorState = {
  isConnectingToKernel: false,
  connectToKernelErrorMessage: '',

  isLockingCell: false,
  isUnlockingCell: false,
  isAddingCell: false,
  isDeletingCell: false,
  isEditingCell: false,

  isExecutingCode: false,
  executeCodeErrorMessage: '',

  lockedCellId: '',
  lockedCells: [],

  executionCount: 0,
  runningCellId: '',

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
};

/**
 * The editor reducer
 */
const reducer = (state = initialState, action: EditorActionTypes): EditorState => {
  switch (action.type) {
    case KERNEL_GATEWAY.SET:
      return {
        ...state,
        gatewayUri: action.uri,
      };
    case CONNECT_TO_KERNEL.START:
      return {
        ...state,
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
    case LOCK_CELL.START:
      return {
        ...state,
        isLockingCell: true,
      };
    case LOCK_CELL.SUCCESS:
      return {
        ...state,
        isLockingCell: action.isMe ? false : state.isLockingCell,
        lockedCellId: action.isMe ? action.cell_id : state.lockedCellId,
        lockedCells: [
          ...state.lockedCells,
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
        lockedCells: state.lockedCells.filter((lock) => lock.cell_id !== action.cell_id),
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
    case DELETE_CELL.SUCCESS:
      return {
        ...state,
        isDeletingCell: action.isMe ? false : state.isDeletingCell,
        lockedCellId: action.isMe ? '' : state.lockedCellId,
        lockedCells: state.lockedCells.filter((lock) => lock.cell_id !== action.cell_id),
        cells: state.cells.filter((cell) => cell.cell_id !== action.cell_id),
      };
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
    case EXECUTE_CODE.START:
      return {
        ...state,
        isExecutingCode: true,
        runningCellId: action.cell_id,
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
        executeCodeErrorMessage: action.error.message,
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
