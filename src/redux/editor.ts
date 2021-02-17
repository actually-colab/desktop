import { IKernel } from 'jupyter-js-services';

import {
  ADD_CELL_FAILURE,
  ADD_CELL_START,
  ADD_CELL_SUCCESS,
  CONNECT_TO_KERNEL_FAILURE,
  CONNECT_TO_KERNEL_START,
  CONNECT_TO_KERNEL_SUCCESS,
  DELETE_CELL_FAILURE,
  DELETE_CELL_START,
  DELETE_CELL_SUCCESS,
  EditorActionTypes,
  EDIT_CELL_FAILURE,
  EDIT_CELL_START,
  EDIT_CELL_SUCCESS,
  EXECUTE_CODE_FAILURE,
  EXECUTE_CODE_START,
  EXECUTE_CODE_SUCCESS,
  LOCK_CELL_FAILURE,
  LOCK_CELL_START,
  LOCK_CELL_SUCCESS,
  RECEIVE_KERNEL_MESSAGE,
  UNLOCK_CELL_FAILURE,
  UNLOCK_CELL_START,
  UNLOCK_CELL_SUCCESS,
  UPDATE_CELL_CODE,
} from '../types/redux/editor';
import { EditorCell, KernelOutput, Lock } from '../types/notebook';
import { BASE_CELL } from '../constants/notebook';

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
  kernel: IKernel | null;
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
  kernel: null,
  cells: [],
  outputs: [],
};

const reducer = (state = initialState, action: EditorActionTypes): EditorState => {
  switch (action.type) {
    case CONNECT_TO_KERNEL_START:
      return {
        ...state,
        isConnectingToKernel: true,
        connectToKernelErrorMessage: '',
        kernel: null,
      };
    case CONNECT_TO_KERNEL_SUCCESS:
      return {
        ...state,
        isConnectingToKernel: false,
        kernel: action.kernel,
      };
    case CONNECT_TO_KERNEL_FAILURE:
      return {
        ...state,
        isConnectingToKernel: false,
        connectToKernelErrorMessage: action.error.message,
      };
    case LOCK_CELL_START:
      return {
        ...state,
        isLockingCell: true,
      };
    case LOCK_CELL_SUCCESS:
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
    case LOCK_CELL_FAILURE:
      return {
        ...state,
        isLockingCell: false,
      };
    case UNLOCK_CELL_START:
      return {
        ...state,
        isUnlockingCell: true,
      };
    case UNLOCK_CELL_SUCCESS:
      return {
        ...state,
        isUnlockingCell: action.isMe ? false : state.isUnlockingCell,
        lockedCellId: action.isMe ? '' : state.lockedCellId,
        lockedCells: state.lockedCells.filter((lock) => lock.cell_id !== action.cell_id),
      };
    case UNLOCK_CELL_FAILURE:
      return {
        ...state,
        isUnlockingCell: false,
      };
    case ADD_CELL_START:
      return {
        ...state,
        isAddingCell: true,
      };
    case ADD_CELL_SUCCESS: {
      const newCells = [...state.cells];

      newCells.splice(action.index === -1 ? newCells.length - 1 : action.index, 0, {
        ...BASE_CELL,
        cell_id: action.cell_id,
      });

      return {
        ...state,
        isAddingCell: action.isMe ? false : state.isAddingCell,
        cells: newCells,
      };
    }
    case ADD_CELL_FAILURE:
      return {
        ...state,
        isAddingCell: false,
      };
    case DELETE_CELL_START:
      return {
        ...state,
        isDeletingCell: true,
      };
    case DELETE_CELL_SUCCESS:
      return {
        ...state,
        isDeletingCell: action.isMe ? false : state.isDeletingCell,
        lockedCellId: action.isMe ? '' : state.lockedCellId,
        lockedCells: state.lockedCells.filter((lock) => lock.cell_id !== action.cell_id),
        cells: state.cells.filter((cell) => cell.cell_id !== action.cell_id),
      };
    case DELETE_CELL_FAILURE:
      return {
        ...state,
        isDeletingCell: false,
      };
    case EDIT_CELL_START:
      return {
        ...state,
        isEditingCell: true,
      };
    case EDIT_CELL_SUCCESS:
      return {
        ...state,
        isEditingCell: action.isMe ? false : state.isDeletingCell,
        cells: state.cells.map((cell) =>
          cell.cell_id === action.cell_id
            ? {
                ...cell,
                ...action.changes,
              }
            : cell
        ),
      };
    case EDIT_CELL_FAILURE:
      return {
        ...state,
        isEditingCell: false,
      };
    case EXECUTE_CODE_START:
      return {
        ...state,
        isExecutingCode: true,
        runningCellId: action.cell_id,
      };
    case EXECUTE_CODE_SUCCESS:
      return {
        ...state,
        isExecutingCode: false,
        runningCellId: '',
        executionCount: action.runIndex,
        cells: state.cells.map((cell) =>
          cell.cell_id === action.cell_id
            ? {
                ...cell,
                runIndex: action.runIndex,
              }
            : cell
        ),
      };
    case EXECUTE_CODE_FAILURE:
      return {
        ...state,
        isExecutingCode: false,
        runningCellId: '',
        executeCodeErrorMessage: action.error.message,
      };
    case RECEIVE_KERNEL_MESSAGE:
      return {
        ...state,
        outputs: [...state.outputs, action.message],
      };
    case UPDATE_CELL_CODE:
      return {
        ...state,
        cells: state.cells.map((cell) =>
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
