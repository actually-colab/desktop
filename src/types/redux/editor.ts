import { IKernel } from 'jupyter-js-services';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { User } from '../user';
import { EditorCell, KernelOutput } from '../notebook';
import { KernelLog } from '../kernel';

export const KERNEL_LOG = {
  APPEND: 'KERNEL_LOG_APPEND',
  CLEAR: 'KERNEL_LOG_CLEAR',
} as const;
export const KERNEL_GATEWAY = {
  SET: 'SET_KERNEL_GATEWAY',
} as const;
export const CONNECT_TO_KERNEL = {
  START: 'CONNECT_TO_KERNEL_START',
  SUCCESS: 'CONNECT_TO_KERNEL_SUCCESS',
  FAILURE: 'CONNECT_TO_KERNEL_FAILURE',
  END: 'CONNECT_TO_KERNEL_END',
  RECONNECTING: 'CONNECT_TO_KERNEL_RECONNECTING',
  RECONNECTED: 'CONNECT_TO_KERNEL_RECONNECTED',
} as const;
export const LOCK_CELL = {
  START: 'LOCK_CELL_START',
  SUCCESS: 'LOCK_CELL_SUCCESS',
  FAILURE: 'LOCK_CELL_FAILURE',
} as const;
export const UNLOCK_CELL = {
  START: 'UNLOCK_CELL_START',
  SUCCESS: 'UNLOCK_CELL_SUCCESS',
  FAILURE: 'UNLOCK_CELL_FAILURE',
} as const;
export const ADD_CELL = {
  START: 'ADD_CELL_START',
  SUCCESS: 'ADD_CELL_SUCCESS',
  FAILURE: 'ADD_CELL_FAILURE',
} as const;
export const DELETE_CELL = {
  START: 'DELETE_CELL_START',
  SUCCESS: 'DELETE_CELL_SUCCESS',
  FAILURE: 'DELETE_CELL_FAILURE',
} as const;
export const MOVE_CELL = {
  START: 'MOVE_CELL_START',
  SUCCESS: 'MOVE_CELL_SUCCESS',
  FAILURE: 'MOVE_CELL_FAILURE',
} as const;
export const EDIT_CELL = {
  START: 'EDIT_CELL_START',
  SUCCESS: 'EDIT_CELL_SUCCESS',
  FAILURE: 'EDIT_CELL_FAILURE',
  UPDATE_CODE: 'EDIT_CELL_UPDATE_CODE',
} as const;
export const EXECUTE_CODE = {
  START: 'EXECUTE_CODE_START',
  SUCCESS: 'EXECUTE_CODE_SUCCESS',
  FAILURE: 'EXECUTE_CODE_FAILURE',
} as const;
export const KERNEL_MESSAGE = {
  RECEIVE: 'KERNEL_MESSAGE_RECEIVE',
  UPDATE_RUN_INDEX: 'KERNEL_MESSAGE_UPDATE_RUN_INDEX',
} as const;
export const INTERRUPT_KERNEL = {
  START: 'INTERRUPT_KERNEL_START',
} as const;

type ActionError = {
  error: {
    message: string;
  };
};

type KernelLogAppendAction = {
  type: typeof KERNEL_LOG.APPEND;
  log: Omit<KernelLog, 'id'>;
};

type KernelLogClearAction = {
  type: typeof KERNEL_LOG.CLEAR;
};

type SetKernelGatewayAction = {
  type: typeof KERNEL_GATEWAY.SET;
  uri: string;
};

type ConnectToKernelStartAction = {
  type: typeof CONNECT_TO_KERNEL.START;
};

type ConnectToKernelSuccessAction = {
  type: typeof CONNECT_TO_KERNEL.SUCCESS;
  kernel: IKernel;
};

type ConnectToKernelFailureAction = {
  type: typeof CONNECT_TO_KERNEL.FAILURE;
} & ActionError;

type ConnectToKernelEndAction = {
  type: typeof CONNECT_TO_KERNEL.END;
};

type ConnectToKernelReconnectingAction = {
  type: typeof CONNECT_TO_KERNEL.RECONNECTING;
};

type ConnectToKernelReconnectedAction = {
  type: typeof CONNECT_TO_KERNEL.RECONNECTED;
};

type LockCellStartAction = {
  type: typeof LOCK_CELL.START;
};

type LockCellSuccessAction = {
  type: typeof LOCK_CELL.SUCCESS;
  isMe: boolean;
  uid: User['uid'];
  cell_id: EditorCell['cell_id'];
};

type LockCellFailureAction = {
  type: typeof LOCK_CELL.FAILURE;
} & ActionError;

type UnlockCellStartAction = {
  type: typeof UNLOCK_CELL.START;
};

type UnlockCellSuccessAction = {
  type: typeof UNLOCK_CELL.SUCCESS;
  isMe: boolean;
  uid: User['uid'];
  cell_id: EditorCell['cell_id'];
};

type UnlockCellFailureAction = {
  type: typeof UNLOCK_CELL.FAILURE;
} & ActionError;

type AddCellStartAction = {
  type: typeof ADD_CELL.START;
};

type AddCellSuccessAction = {
  type: typeof ADD_CELL.SUCCESS;
  isMe: boolean;
  cell_id: EditorCell['cell_id'];
  index: number;
};

type AddCellFailureAction = {
  type: typeof ADD_CELL.FAILURE;
} & ActionError;

type DeleteCellStartAction = {
  type: typeof DELETE_CELL.START;
};

type DeleteCellSuccessAction = {
  type: typeof DELETE_CELL.SUCCESS;
  isMe: boolean;
  cell_id: EditorCell['cell_id'];
};

type DeleteCellFailureAction = {
  type: typeof DELETE_CELL.FAILURE;
} & ActionError;

type MoveCellStartAction = {
  type: typeof MOVE_CELL.START;
};

type MoveCellSuccessAction = {
  type: typeof MOVE_CELL.SUCCESS;
  cell_id: EditorCell['cell_id'];
  index: number;
};

type MoveCellFailureAction = {
  type: typeof MOVE_CELL.FAILURE;
} & ActionError;

type EditCellStartAction = {
  type: typeof EDIT_CELL.START;
};

type EditCellSuccessAction = {
  type: typeof EDIT_CELL.SUCCESS;
  isMe: boolean;
  cell_id: EditorCell['cell_id'];
  changes: Partial<EditorCell>;
};

type EditCellFailureAction = {
  type: typeof EDIT_CELL.FAILURE;
} & ActionError;

type ExecuteCodeStartAction = {
  type: typeof EXECUTE_CODE.START;
  cell_id: EditorCell['cell_id'];
};

type ExecuteCodeSuccessAction = {
  type: typeof EXECUTE_CODE.SUCCESS;
  cell_id: EditorCell['cell_id'];
  runIndex: number;
};

type ExecuteCodeFailureAction = {
  type: typeof EXECUTE_CODE.FAILURE;
  cell_id: EditorCell['cell_id'];
} & ActionError;

type KernelMessageReceiveAction = {
  type: typeof KERNEL_MESSAGE.RECEIVE;
  cell_id: EditorCell['cell_id'];
  message: KernelOutput;
};

type KernelMessageUpdateRunIndexAction = {
  type: typeof KERNEL_MESSAGE.UPDATE_RUN_INDEX;
  cell_id: EditorCell['cell_id'];
  runIndex: number;
};

type UpdateCellCodeAction = {
  type: typeof EDIT_CELL.UPDATE_CODE;
  cell_id: EditorCell['cell_id'];
  code: string;
};

/**
 * An action for manipulating the editor redux store
 */
export type EditorActionTypes =
  | KernelLogAppendAction
  | KernelLogClearAction
  | SetKernelGatewayAction
  | ConnectToKernelStartAction
  | ConnectToKernelSuccessAction
  | ConnectToKernelFailureAction
  | ConnectToKernelEndAction
  | ConnectToKernelReconnectingAction
  | ConnectToKernelReconnectedAction
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
  | KernelMessageReceiveAction
  | KernelMessageUpdateRunIndexAction
  | UpdateCellCodeAction;

/**
 * An asynchronous action for manipulating the editor redux store
 */
export type EditorAsyncActionTypes = ThunkAction<void, unknown, unknown, Action<string>>;
