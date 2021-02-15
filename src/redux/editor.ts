import { IKernel } from 'jupyter-js-services';

import {
  ADD_CELL_FAILURE,
  ADD_CELL_START,
  ADD_CELL_SUCCESS,
  CONNECT_TO_KERNEL_FAILURE,
  CONNECT_TO_KERNEL_START,
  CONNECT_TO_KERNEL_SUCCESS,
  EditorActionTypes,
  EDIT_CELL_FAILURE,
  EDIT_CELL_START,
  EDIT_CELL_SUCCESS,
  EXECUTE_CODE_FAILURE,
  EXECUTE_CODE_START,
  EXECUTE_CODE_SUCCESS,
  RECEIVE_KERNEL_MESSAGE,
  UPDATE_CELL_CODE,
} from '../types/redux/editor';
import { EditorCell, KernelOutput } from '../types/notebook';
import { BASE_CELL } from '../constants/notebook';

export interface EditorState {
  isConnectingToKernel: boolean;
  connectToKernelErrorMessage: string;

  isAddingCell: boolean;
  isEditingCell: boolean;

  isExecutingCode: boolean;
  executeCodeErrorMessage: string;

  activeCellId: string;
  executionCount: number;
  kernel: IKernel | null;
  cells: EditorCell[];
  outputs: KernelOutput[];
}

const initialState: EditorState = {
  isConnectingToKernel: false,
  connectToKernelErrorMessage: '',

  isAddingCell: false,
  isEditingCell: false,

  isExecutingCode: false,
  executeCodeErrorMessage: '',

  activeCellId: '',
  executionCount: 0,
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
    case ADD_CELL_START:
      return {
        ...state,
        isAddingCell: true,
      };
    case ADD_CELL_SUCCESS: {
      const newCells = [...state.cells];

      newCells.splice(action.index === -1 ? newCells.length - 1 : action.index, 0, {
        ...BASE_CELL,
        _id: action.cellId,
      });

      return {
        ...state,
        isAddingCell: false,
        cells: newCells,
      };
    }
    case ADD_CELL_FAILURE:
      return {
        ...state,
        isAddingCell: false,
      };
    case EDIT_CELL_START:
      return {
        ...state,
        isEditingCell: true,
      };
    case EDIT_CELL_SUCCESS:
      return {
        ...state,
        isEditingCell: false,
        cells: state.cells.map((cell) =>
          cell._id === action.cellId
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
        executionCount: state.executionCount + 1,
        cells: state.cells.map((cell) =>
          cell._id === action.cellId
            ? {
                ...cell,
                active: true,
                runIndex: state.executionCount + 1,
              }
            : cell
        ),
      };
    case EXECUTE_CODE_SUCCESS:
      return {
        ...state,
        isExecutingCode: false,
        cells: state.cells.map((cell) =>
          cell._id === action.cellId
            ? {
                ...cell,
                active: false,
              }
            : cell
        ),
      };
    case EXECUTE_CODE_FAILURE:
      return {
        ...state,
        isExecutingCode: false,
        executeCodeErrorMessage: action.error.message,
        cells: state.cells.map((cell) =>
          cell._id === action.cellId
            ? {
                ...cell,
                active: false,
              }
            : cell
        ),
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
          cell._id === action.cellId
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
