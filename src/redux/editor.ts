import { IKernel } from 'jupyter-js-services';
import { EditorCell } from '../kernel/types';
import {
  CONNECT_TO_KERNEL_FAILURE,
  CONNECT_TO_KERNEL_START,
  CONNECT_TO_KERNEL_SUCCESS,
  EditorActionTypes,
  EXECUTE_CODE_FAILURE,
  EXECUTE_CODE_START,
  EXECUTE_CODE_SUCCESS,
  RECEIVE_KERNEL_MESSAGE,
  UPDATE_CELL_CODE,
} from './types/editor';

export interface EditorState {
  isConnectingToKernel: boolean;
  connectToKernelErrorMessage: string;

  isExecutingCode: boolean;
  executeCodeErrorMessage: string;

  executionCount: number;
  kernel: IKernel | null;
  cells: EditorCell[];
}

const initialState: EditorState = {
  isConnectingToKernel: false,
  connectToKernelErrorMessage: '',

  isExecutingCode: false,
  executeCodeErrorMessage: '',

  executionCount: 0,
  kernel: null,
  cells: [
    {
      _id: 'some-uuuid',
      runIndex: -1,
      active: false,
      code: '',
      output: [],
    },
  ],
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
                output: [],
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
        cells: state.cells.map((cell) =>
          cell._id === action.cellId
            ? {
                ...cell,
                output: [...cell.output, action.message],
              }
            : cell
        ),
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
