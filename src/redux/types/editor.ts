import { IKernel } from 'jupyter-js-services';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { KernelOutput } from '../../kernel/types';

export const CONNECT_TO_KERNEL_START = 'CONNECT_TO_KERNEL_START';
export const CONNECT_TO_KERNEL_SUCCESS = 'CONNECT_TO_KERNEL_SUCCESS';
export const CONNECT_TO_KERNEL_FAILURE = 'CONNECT_TO_KERNEL_FAILURE';
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
  | ExecuteCodeStartAction
  | ExecuteCodeSuccessAction
  | ExecuteCodeFailureAction
  | ReceiveKernelMessageAction
  | UpdateCellCodeAction;

export type EditorAsyncActionTypes = ThunkAction<void, unknown, unknown, Action<string>>;
