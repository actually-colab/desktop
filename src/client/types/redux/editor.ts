import { IKernel } from 'jupyter-js-services';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { User } from '../user';
import { EditorCell, KernelOutput } from '../notebook';
import { StdoutMessage } from '../../../shared/types/ipc';

export const KERNEL_PROCESS_START = 'KERNEL_PROCESS_START';
export const KERNEL_PROCESS_STDOUT = 'KERNEL_PROCESS_STDOUT';
export const SET_KERNEL_GATEWAY = 'SET_KERNEL_GATEWAY';
export const CONNECT_TO_KERNEL_START = 'CONNECT_TO_KERNEL_START';
export const CONNECT_TO_KERNEL_SUCCESS = 'CONNECT_TO_KERNEL_SUCCESS';
export const CONNECT_TO_KERNEL_FAILURE = 'CONNECT_TO_KERNEL_FAILURE';
export const LOCK_CELL_START = 'LOCK_CELL_START';
export const LOCK_CELL_SUCCESS = 'LOCK_CELL_SUCCESS';
export const LOCK_CELL_FAILURE = 'LOCK_CELL_FAILURE';
export const UNLOCK_CELL_START = 'UNLOCK_CELL_START';
export const UNLOCK_CELL_SUCCESS = 'UNLOCK_CELL_SUCCESS';
export const UNLOCK_CELL_FAILURE = 'UNLOCK_CELL_FAILURE';
export const ADD_CELL_START = 'ADD_CELL_START';
export const ADD_CELL_SUCCESS = 'ADD_CELL_SUCCESS';
export const ADD_CELL_FAILURE = 'ADD_CELL_FAILURE';
export const DELETE_CELL_START = 'DELETE_CELL_START';
export const DELETE_CELL_SUCCESS = 'DELETE_CELL_SUCCESS';
export const DELETE_CELL_FAILURE = 'DELETE_CELL_FAILURE';
export const MOVE_CELL_START = 'MOVE_CELL_START';
export const MOVE_CELL_SUCCESS = 'MOVE_CELL_SUCCESS';
export const MOVE_CELL_FAILURE = 'MOVE_CELL_FAILURE';
export const EDIT_CELL_START = 'EDIT_CELL_START';
export const EDIT_CELL_SUCCESS = 'EDIT_CELL_SUCCESS';
export const EDIT_CELL_FAILURE = 'EDIT_CELL_FAILURE';
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

type KernelProcessStartAction = {
  type: typeof KERNEL_PROCESS_START;
  pid: number;
  version: string;
};

type KernelProcessStdoutAction = {
  type: typeof KERNEL_PROCESS_STDOUT;
  message: StdoutMessage;
};

type SetKernelGatewayAction = {
  type: typeof SET_KERNEL_GATEWAY;
  uri: string;
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

type LockCellStartAction = {
  type: typeof LOCK_CELL_START;
};

type LockCellSuccessAction = {
  type: typeof LOCK_CELL_SUCCESS;
  isMe: boolean;
  uid: User['uid'];
  cell_id: EditorCell['cell_id'];
};

type LockCellFailureAction = {
  type: typeof LOCK_CELL_FAILURE;
} & ActionError;

type UnlockCellStartAction = {
  type: typeof UNLOCK_CELL_START;
};

type UnlockCellSuccessAction = {
  type: typeof UNLOCK_CELL_SUCCESS;
  isMe: boolean;
  uid: User['uid'];
  cell_id: EditorCell['cell_id'];
};

type UnlockCellFailureAction = {
  type: typeof UNLOCK_CELL_FAILURE;
} & ActionError;

type AddCellStartAction = {
  type: typeof ADD_CELL_START;
};

type AddCellSuccessAction = {
  type: typeof ADD_CELL_SUCCESS;
  isMe: boolean;
  cell_id: EditorCell['cell_id'];
  index: number;
};

type AddCellFailureAction = {
  type: typeof ADD_CELL_FAILURE;
} & ActionError;

type DeleteCellStartAction = {
  type: typeof DELETE_CELL_START;
};

type DeleteCellSuccessAction = {
  type: typeof DELETE_CELL_SUCCESS;
  isMe: boolean;
  cell_id: EditorCell['cell_id'];
};

type DeleteCellFailureAction = {
  type: typeof DELETE_CELL_FAILURE;
} & ActionError;

type MoveCellStartAction = {
  type: typeof MOVE_CELL_START;
};

type MoveCellSuccessAction = {
  type: typeof MOVE_CELL_SUCCESS;
  cell_id: EditorCell['cell_id'];
  index: number;
};

type MoveCellFailureAction = {
  type: typeof MOVE_CELL_FAILURE;
} & ActionError;

type EditCellStartAction = {
  type: typeof EDIT_CELL_START;
};

type EditCellSuccessAction = {
  type: typeof EDIT_CELL_SUCCESS;
  isMe: boolean;
  cell_id: EditorCell['cell_id'];
  changes: Partial<EditorCell>;
};

type EditCellFailureAction = {
  type: typeof EDIT_CELL_FAILURE;
} & ActionError;

type ExecuteCodeStartAction = {
  type: typeof EXECUTE_CODE_START;
  cell_id: EditorCell['cell_id'];
};

type ExecuteCodeSuccessAction = {
  type: typeof EXECUTE_CODE_SUCCESS;
  cell_id: EditorCell['cell_id'];
  runIndex: number;
};

type ExecuteCodeFailureAction = {
  type: typeof EXECUTE_CODE_FAILURE;
  cell_id: EditorCell['cell_id'];
} & ActionError;

type ReceiveKernelMessageAction = {
  type: typeof RECEIVE_KERNEL_MESSAGE;
  cell_id: EditorCell['cell_id'];
  message: KernelOutput;
};

type UpdateCellCodeAction = {
  type: typeof UPDATE_CELL_CODE;
  cell_id: EditorCell['cell_id'];
  code: string;
};

export type EditorActionTypes =
  | KernelProcessStartAction
  | KernelProcessStdoutAction
  | SetKernelGatewayAction
  | ConnectToKernelStartAction
  | ConnectToKernelSuccessAction
  | ConnectToKernelFailureAction
  | LockCellStartAction
  | LockCellSuccessAction
  | LockCellFailureAction
  | UnlockCellStartAction
  | UnlockCellSuccessAction
  | UnlockCellFailureAction
  | AddCellStartAction
  | AddCellSuccessAction
  | AddCellFailureAction
  | DeleteCellStartAction
  | DeleteCellSuccessAction
  | DeleteCellFailureAction
  | MoveCellStartAction
  | MoveCellSuccessAction
  | MoveCellFailureAction
  | EditCellStartAction
  | EditCellSuccessAction
  | EditCellFailureAction
  | ExecuteCodeStartAction
  | ExecuteCodeSuccessAction
  | ExecuteCodeFailureAction
  | ReceiveKernelMessageAction
  | UpdateCellCodeAction;

export type EditorAsyncActionTypes = ThunkAction<void, unknown, unknown, Action<string>>;
