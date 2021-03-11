import { IKernel } from 'jupyter-js-services';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Notebook } from '@actually-colab/editor-client';

import { User } from '../user';
import { EditorCell, KernelOutput } from '../notebook';
import { KernelLog } from '../kernel';

export const KERNEL_LOG = {
  APPEND: 'KERNEL_LOG_APPEND',
  CLEAR: 'KERNEL_LOG_CLEAR',
} as const;
export const KERNEL_GATEWAY = {
  SET: 'SET_KERNEL_GATEWAY',
  EDIT: ' SET_KERNEL_GATEWAY_EDIT',
} as const;
export const CONNECT_TO_KERNEL = {
  AUTO: 'CONNECT_TO_KERNEL_AUTO',
  START: 'CONNECT_TO_KERNEL_START',
  SUCCESS: 'CONNECT_TO_KERNEL_SUCCESS',
  FAILURE: 'CONNECT_TO_KERNEL_FAILURE',
  RECONNECTING: 'CONNECT_TO_KERNEL_RECONNECTING',
  RECONNECTED: 'CONNECT_TO_KERNEL_RECONNECTED',
  DISCONNECTED: 'CONNECT_TO_KERNEL_DISCONNECTED',
} as const;
export const NOTEBOOKS = {
  GET: {
    START: 'NOTEBOOKS_GET_START',
    SUCCESS: 'NOTEBOOKS_GET_SUCCESS',
    FAILURE: 'NOTEBOOKS_GET_FAILURE',
  },
  CREATE: {
    START: 'NOTEBOOKS_CREATE_START',
    SUCCESS: 'NOTEBOOKS_CREATE_SUCCESS',
    FAILURE: 'NOTEBOOKS_CREATE_FAILURE',
  },
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
export const SELECT_CELL = {
  SET: 'SELECT_CELL_SET',
  NEXT: 'SELECT_CELL_NEXT',
} as const;
export const EXECUTE_CODE = {
  QUEUE: 'EXECUTE_CODE_QUEUE',
  START: 'EXECUTE_CODE_START',
  SUCCESS: 'EXECUTE_CODE_SUCCESS',
  FAILURE: 'EXECUTE_CODE_FAILURE',
  STOPPED: 'EXECUTE_CODE_STOPPED',
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

type SetKernelGatewayEditAction = {
  type: typeof KERNEL_GATEWAY.EDIT;
  editing: boolean;
};

type ConnectToKernelAutoAction = {
  type: typeof CONNECT_TO_KERNEL.AUTO;
  enable: boolean;
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

type ConnectToKernelReconnectingAction = {
  type: typeof CONNECT_TO_KERNEL.RECONNECTING;
};

type ConnectToKernelReconnectedAction = {
  type: typeof CONNECT_TO_KERNEL.RECONNECTED;
};

type ConnectToKernelDisconnectedAction = {
  type: typeof CONNECT_TO_KERNEL.DISCONNECTED;
  retry: boolean;
};

type NotebooksGetStartAction = {
  type: typeof NOTEBOOKS.GET.START;
};

type NotebooksGetSuccessAction = {
  type: typeof NOTEBOOKS.GET.SUCCESS;
  notebooks: Notebook[];
};

type NotebooksGetFailureAction = {
  type: typeof NOTEBOOKS.GET.FAILURE;
} & ActionError;

type NotebooksCreateStartAction = {
  type: typeof NOTEBOOKS.CREATE.START;
};

type NotebooksCreateSuccessAction = {
  type: typeof NOTEBOOKS.CREATE.SUCCESS;
  notebook: Notebook;
};

type NotebooksCreateFailureAction = {
  type: typeof NOTEBOOKS.CREATE.FAILURE;
} & ActionError;

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

type SelectCellSetAction = {
  type: typeof SELECT_CELL.SET;
  cell_id: EditorCell['cell_id'];
};

type SelectCellNextAction = {
  type: typeof SELECT_CELL.NEXT;
};

type ExecuteCodeQueueAction = {
  type: typeof EXECUTE_CODE.QUEUE;
  cell_id: EditorCell['cell_id'];
};

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
  runIndex: number;
} & ActionError;

type ExecuteCodeStoppedAction = {
  type: typeof EXECUTE_CODE.STOPPED;
  cell_id: EditorCell['cell_id'];
};

type KernelMessageReceiveAction = {
  type: typeof KERNEL_MESSAGE.RECEIVE;
  cell_id: EditorCell['cell_id'];
  messages: KernelOutput[];
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
  | SetKernelGatewayEditAction
  | ConnectToKernelAutoAction
  | ConnectToKernelStartAction
  | ConnectToKernelSuccessAction
  | ConnectToKernelFailureAction
  | ConnectToKernelReconnectingAction
  | ConnectToKernelReconnectedAction
  | ConnectToKernelDisconnectedAction
  | NotebooksGetStartAction
  | NotebooksGetSuccessAction
  | NotebooksGetFailureAction
  | NotebooksCreateStartAction
  | NotebooksCreateSuccessAction
  | NotebooksCreateFailureAction
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
  | SelectCellSetAction
  | SelectCellNextAction
  | ExecuteCodeQueueAction
  | ExecuteCodeStartAction
  | ExecuteCodeSuccessAction
  | ExecuteCodeFailureAction
  | ExecuteCodeStoppedAction
  | KernelMessageReceiveAction
  | KernelMessageUpdateRunIndexAction
  | UpdateCellCodeAction;

/**
 * An asynchronous action for manipulating the editor redux store
 */
export type EditorAsyncActionTypes = ThunkAction<void, unknown, unknown, Action<string>>;
