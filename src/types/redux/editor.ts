import { IKernel } from 'jupyter-js-services';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Notebook, NotebookContents } from '@actually-colab/editor-client';

import { User } from '../user';
import { EditorCell, KernelOutput } from '../notebook';
import { KernelLog } from '../kernel';

export const KERNEL = {
  LOG: {
    APPEND: 'KERNEL_LOG_APPEND',
    CLEAR: 'KERNEL_LOG_CLEAR',
  },
  GATEWAY: {
    SET: 'KERNEL_GATEWAY_SET',
    EDIT: ' KERNEL_GATEWAY_EDIT',
  },
  CONNECT: {
    AUTO: 'KERNEL_CONNECT_AUTO',
    START: 'KERNEL_CONNECT_START',
    SUCCESS: 'KERNEL_CONNECT_SUCCESS',
    FAILURE: 'KERNEL_CONNECT_FAILURE',
    RECONNECTING: 'KERNEL_CONNECT_RECONNECTING',
    RECONNECTED: 'KERNEL_CONNECT_RECONNECTED',
    DISCONNECTED: 'KERNEL_CONNECT_DISCONNECTED',
    RESTARTED: 'KERNEL_CONNECT_RESTARTED',
  },
  EXECUTE: {
    QUEUE: 'EXECUTE_CODE_QUEUE',
    START: 'EXECUTE_CODE_START',
    SUCCESS: 'EXECUTE_CODE_SUCCESS',
    FAILURE: 'EXECUTE_CODE_FAILURE',
    STOPPED: 'EXECUTE_CODE_STOPPED',
  },
  MESSAGE: {
    RECEIVE: 'KERNEL_MESSAGE_RECEIVE',
    UPDATE_RUN_INDEX: 'KERNEL_MESSAGE_UPDATE_RUN_INDEX',
  },
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
  OPEN: {
    START: 'NOTEBOOKS_OPEN_START',
    SUCCESS: 'NOTEBOOKS_OPEN_SUCCESS',
    FAILURE: 'NOTEBOOKS_OPEN_FAILURE',
    DEMO: 'NOTEBOOKS_OPEN_DEMO',
  },
} as const;
export const CELL = {
  LOCK: {
    START: 'CELL_LOCK_START',
    SUCCESS: 'CELL_LOCK_SUCCESS',
    FAILURE: 'CELL_LOCK_FAILURE',
  },
  UNLOCK: {
    START: 'CELL_UNLOCK_START',
    SUCCESS: 'CELL_UNLOCK_SUCCESS',
    FAILURE: 'CELL_UNLOCK_FAILURE',
  },
  ADD: {
    START: 'CELL_ADD_START',
    SUCCESS: 'CELL_ADD_SUCCESS',
    FAILURE: 'CELL_ADD_FAILURE',
  },
  DELETE: {
    START: 'CELL_DELETE_START',
    SUCCESS: 'CELL_DELETE_SUCCESS',
    FAILURE: 'CELL_DELETE_FAILURE',
  },
  MOVE: {
    START: 'CELL_MOVE_START',
    SUCCESS: 'CELL_MOVE_SUCCESS',
    FAILURE: 'CELL_MOVE_FAILURE',
  },
  EDIT: {
    START: 'CELL_EDIT_START',
    SUCCESS: 'CELL_EDIT_SUCCESS',
    FAILURE: 'CELL_EDIT_FAILURE',
    UPDATE_CODE: 'CELL_EDIT_UPDATE_CODE',
  },
  SELECT: {
    SET: 'CELL_SELECT_SET',
    NEXT: 'CELL_SELECT_NEXT',
  },
} as const;

type ActionError = {
  error: {
    message: string;
  };
};

type KernelLogAppendAction = {
  type: typeof KERNEL.LOG.APPEND;
  log: Omit<KernelLog, 'id'>;
};

type KernelLogClearAction = {
  type: typeof KERNEL.LOG.CLEAR;
};

type SetKernelGatewayAction = {
  type: typeof KERNEL.GATEWAY.SET;
  uri: string;
};

type SetKernelGatewayEditAction = {
  type: typeof KERNEL.GATEWAY.EDIT;
  editing: boolean;
};

type ConnectToKernelAutoAction = {
  type: typeof KERNEL.CONNECT.AUTO;
  enable: boolean;
};

type ConnectToKernelStartAction = {
  type: typeof KERNEL.CONNECT.START;
};

type ConnectToKernelSuccessAction = {
  type: typeof KERNEL.CONNECT.SUCCESS;
  kernel: IKernel;
};

type ConnectToKernelFailureAction = {
  type: typeof KERNEL.CONNECT.FAILURE;
} & ActionError;

type ConnectToKernelReconnectingAction = {
  type: typeof KERNEL.CONNECT.RECONNECTING;
};

type ConnectToKernelReconnectedAction = {
  type: typeof KERNEL.CONNECT.RECONNECTED;
};

type ConnectToKernelDisconnectedAction = {
  type: typeof KERNEL.CONNECT.DISCONNECTED;
  retry: boolean;
};

type ConnectToKernelRestartedAction = {
  type: typeof KERNEL.CONNECT.RESTARTED;
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

type NotebooksOpenStartAction = {
  type: typeof NOTEBOOKS.OPEN.START;
  nb_id: Notebook['nb_id'];
};

type NotebooksOpenSuccessAction = {
  type: typeof NOTEBOOKS.OPEN.SUCCESS;
  notebook: NotebookContents;
};

type NotebooksOpenFailureAction = {
  type: typeof NOTEBOOKS.OPEN.FAILURE;
} & ActionError;

type NotebooksOpenDemoAction = {
  type: typeof NOTEBOOKS.OPEN.DEMO;
};

type LockCellStartAction = {
  type: typeof CELL.LOCK.START;
};

type LockCellSuccessAction = {
  type: typeof CELL.LOCK.SUCCESS;
  isMe: boolean;
  uid: User['uid'];
  cell_id: EditorCell['cell_id'];
};

type LockCellFailureAction = {
  type: typeof CELL.LOCK.FAILURE;
} & ActionError;

type UnlockCellStartAction = {
  type: typeof CELL.UNLOCK.START;
};

type UnlockCellSuccessAction = {
  type: typeof CELL.UNLOCK.SUCCESS;
  isMe: boolean;
  uid: User['uid'];
  cell_id: EditorCell['cell_id'];
};

type UnlockCellFailureAction = {
  type: typeof CELL.UNLOCK.FAILURE;
} & ActionError;

type AddCellStartAction = {
  type: typeof CELL.ADD.START;
};

type AddCellSuccessAction = {
  type: typeof CELL.ADD.SUCCESS;
  isMe: boolean;
  cell_id: EditorCell['cell_id'];
  index: number;
};

type AddCellFailureAction = {
  type: typeof CELL.ADD.FAILURE;
} & ActionError;

type DeleteCellStartAction = {
  type: typeof CELL.DELETE.START;
};

type DeleteCellSuccessAction = {
  type: typeof CELL.DELETE.SUCCESS;
  isMe: boolean;
  cell_id: EditorCell['cell_id'];
};

type DeleteCellFailureAction = {
  type: typeof CELL.DELETE.FAILURE;
} & ActionError;

type MoveCellStartAction = {
  type: typeof CELL.MOVE.START;
};

type MoveCellSuccessAction = {
  type: typeof CELL.MOVE.SUCCESS;
  cell_id: EditorCell['cell_id'];
  index: number;
};

type MoveCellFailureAction = {
  type: typeof CELL.MOVE.FAILURE;
} & ActionError;

type EditCellStartAction = {
  type: typeof CELL.EDIT.START;
};

type EditCellSuccessAction = {
  type: typeof CELL.EDIT.SUCCESS;
  isMe: boolean;
  cell_id: EditorCell['cell_id'];
  changes: Partial<EditorCell>;
};

type EditCellFailureAction = {
  type: typeof CELL.EDIT.FAILURE;
} & ActionError;

type UpdateCellCodeAction = {
  type: typeof CELL.EDIT.UPDATE_CODE;
  cell_id: EditorCell['cell_id'];
  code: string;
};

type SelectCellSetAction = {
  type: typeof CELL.SELECT.SET;
  cell_id: EditorCell['cell_id'];
};

type SelectCellNextAction = {
  type: typeof CELL.SELECT.NEXT;
};

type ExecuteCodeQueueAction = {
  type: typeof KERNEL.EXECUTE.QUEUE;
  cell_id: EditorCell['cell_id'];
};

type ExecuteCodeStartAction = {
  type: typeof KERNEL.EXECUTE.START;
  cell_id: EditorCell['cell_id'];
};

type ExecuteCodeSuccessAction = {
  type: typeof KERNEL.EXECUTE.SUCCESS;
  cell_id: EditorCell['cell_id'];
  runIndex: number;
};

type ExecuteCodeFailureAction = {
  type: typeof KERNEL.EXECUTE.FAILURE;
  cell_id: EditorCell['cell_id'];
  runIndex: number;
} & ActionError;

type ExecuteCodeStoppedAction = {
  type: typeof KERNEL.EXECUTE.STOPPED;
  cell_id: EditorCell['cell_id'];
};

type KernelMessageReceiveAction = {
  type: typeof KERNEL.MESSAGE.RECEIVE;
  cell_id: EditorCell['cell_id'];
  messages: KernelOutput[];
};

type KernelMessageUpdateRunIndexAction = {
  type: typeof KERNEL.MESSAGE.UPDATE_RUN_INDEX;
  cell_id: EditorCell['cell_id'];
  runIndex: number;
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
  | ConnectToKernelRestartedAction
  | NotebooksGetStartAction
  | NotebooksGetSuccessAction
  | NotebooksGetFailureAction
  | NotebooksCreateStartAction
  | NotebooksCreateSuccessAction
  | NotebooksCreateFailureAction
  | NotebooksOpenStartAction
  | NotebooksOpenSuccessAction
  | NotebooksOpenFailureAction
  | NotebooksOpenDemoAction
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
  | UpdateCellCodeAction
  | SelectCellSetAction
  | SelectCellNextAction
  | ExecuteCodeQueueAction
  | ExecuteCodeStartAction
  | ExecuteCodeSuccessAction
  | ExecuteCodeFailureAction
  | ExecuteCodeStoppedAction
  | KernelMessageReceiveAction
  | KernelMessageUpdateRunIndexAction;

/**
 * An asynchronous action for manipulating the editor redux store
 */
export type EditorAsyncActionTypes = ThunkAction<void, unknown, unknown, Action<string>>;
