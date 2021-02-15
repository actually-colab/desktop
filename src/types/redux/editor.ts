import { IKernel } from 'jupyter-js-services';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { EditorCell, KernelOutput } from '../notebook';

export const CONNECT_TO_KERNEL_START = 'CONNECT_TO_KERNEL_START';
export const CONNECT_TO_KERNEL_SUCCESS = 'CONNECT_TO_KERNEL_SUCCESS';
export const CONNECT_TO_KERNEL_FAILURE = 'CONNECT_TO_KERNEL_FAILURE';
export const ADD_CELL_START = 'ADD_CELL_START';
export const ADD_CELL_SUCCESS = 'ADD_CELL_SUCCESS';
export const ADD_CELL_FAILURE = 'ADD_CELL_FAILURE';
export const EDIT_CELL_START = 'EDIT_CELL_START';
export const EDIT_CELL_SUCCESS = 'EDIT_CELL_SUCCESS';
export const EDIT_CELL_FAILURE = 'EDIT_CELL_FAILURE';
export const DELETE_CELL_START = 'DELETE_CELL_START';
export const DELETE_CELL_SUCCESS = 'DELETE_CELL_SUCCESS';
export const DELETE_CELL_FAILURE = 'DELETE_CELL_FAILURE';
export const MOVE_CELL_START = 'MOVE_CELL_START';
export const MOVE_CELL_SUCCESS = 'MOVE_CELL_SUCCESS';
export const MOVE_CELL_FAILURE = 'MOVE_CELL_FAILURE';
export const EXECUTE_CODE_START = 'EXECUTE_CODE_START';
export const EXECUTE_CODE_SUCCESS = 'EXECUTE_CODE_SUCCESS';
export const EXECUTE_CODE_FAILURE = 'EXECUTE_CODE_FAILURE';
export const RECEIVE_KERNEL_MESSAGE = 'RECEIVE_KERNEL_MESSAGE';

export const UPDATE_CELL_CODE = 'UPDATE_CELL_CODE';

type ActionError = {
  error: {
    message: string;
  };
};

type ConnectToKernelStartAction = {
  type: typeof CONNECT_TO_KERNEL_START;
};

type ConnectToKernelSuccessAction = {
  type: typeof CONNECT_TO_KERNEL_SUCCESS;
  kernel: IKernel;
};

type ConnectToKernelFailureAction = {
  type: typeof CONNECT_TO_KERNEL_FAILURE;
} & ActionError;

type AddCellStartAction = {
  type: typeof ADD_CELL_START;
};

type AddCellSuccessAction = {
  type: typeof ADD_CELL_SUCCESS;
  cellId: string;
  index: number;
};

type AddCellFailureAction = {
  type: typeof ADD_CELL_FAILURE;
} & ActionError;

type EditCellStartAction = {
  type: typeof EDIT_CELL_START;
};

type EditCellSuccessAction = {
  type: typeof EDIT_CELL_SUCCESS;
  cellId: string;
  changes: Partial<EditorCell>;
};

type EditCellFailureAction = {
  type: typeof EDIT_CELL_FAILURE;
} & ActionError;

type DeleteCellStartAction = {
  type: typeof DELETE_CELL_START;
};

type DeleteCellSuccessAction = {
  type: typeof DELETE_CELL_SUCCESS;
  cellId: string;
};

type DeleteCellFailureAction = {
  type: typeof DELETE_CELL_FAILURE;
} & ActionError;

type MoveCellStartAction = {
  type: typeof MOVE_CELL_START;
};

type MoveCellSuccessAction = {
  type: typeof MOVE_CELL_SUCCESS;
  cellId: string;
  index: number;
};

type MoveCellFailureAction = {
  type: typeof MOVE_CELL_FAILURE;
} & ActionError;

type ExecuteCodeStartAction = {
  type: typeof EXECUTE_CODE_START;
  cellId: string;
};

type ExecuteCodeSuccessAction = {
  type: typeof EXECUTE_CODE_SUCCESS;
  cellId: string;
};

type ExecuteCodeFailureAction = {
  type: typeof EXECUTE_CODE_FAILURE;
  cellId: string;
} & ActionError;

type ReceiveKernelMessageAction = {
  type: typeof RECEIVE_KERNEL_MESSAGE;
  cellId: string;
  message: KernelOutput;
};

type UpdateCellCodeAction = {
  type: typeof UPDATE_CELL_CODE;
  cellId: string;
  code: string;
};

export type EditorActionTypes =
  | ConnectToKernelStartAction
  | ConnectToKernelSuccessAction
  | ConnectToKernelFailureAction
  | AddCellStartAction
  | AddCellSuccessAction
  | AddCellFailureAction
  | EditCellStartAction
  | EditCellSuccessAction
  | EditCellFailureAction
  | DeleteCellStartAction
  | DeleteCellSuccessAction
  | DeleteCellFailureAction
  | MoveCellStartAction
  | MoveCellSuccessAction
  | MoveCellFailureAction
  | ExecuteCodeStartAction
  | ExecuteCodeSuccessAction
  | ExecuteCodeFailureAction
  | ReceiveKernelMessageAction
  | UpdateCellCodeAction;

export type EditorAsyncActionTypes = ThunkAction<void, unknown, unknown, Action<string>>;
