import { IKernel } from 'jupyter-js-services';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';

import {
  ADD_CELL,
  CONNECT_TO_KERNEL,
  DELETE_CELL,
  EditorActionTypes,
  EditorAsyncActionTypes,
  EDIT_CELL,
  EXECUTE_CODE,
  KERNEL_GATEWAY,
  KERNEL_LOG,
  KERNEL_MESSAGE,
  LOCK_CELL,
  UNLOCK_CELL,
} from '../../types/redux/editor';
import { User } from '../../types/user';
import { IpynbOutput } from '../../types/ipynb';
import { BaseKernelOutput, EditorCell, KernelOutput } from '../../types/notebook';
import * as jupyter from '../../kernel/jupyter';
import { _ui } from '.';
import { KernelLog } from '../../types/kernel';

/**
 * Add a new log message
 */
export const appendKernelLog = (log: Omit<KernelLog, 'id' | 'date'>): EditorActionTypes => {
  const date = new Date();

  return {
    type: KERNEL_LOG.APPEND,
    log: {
      ...log,
      date,
      dateString: format(date, 'Pp'),
    },
  };
};

/**
 * Clear the kernel logs
 */
export const clearKernelLogs = (): EditorActionTypes => ({
  type: KERNEL_LOG.CLEAR,
});

/**
 * Set the kernel gateway uri
 */
export const setKernelGateway = (uri: string): EditorActionTypes => ({
  type: KERNEL_GATEWAY.SET,
  uri,
});

/**
 * Set if editing the kernel gateway URI
 */
export const editKernelGateway = (editing: boolean): EditorActionTypes => ({
  type: KERNEL_GATEWAY.EDIT,
  editing,
});

/**
 * Enable or disable connecting to the kernel automatically
 */
export const connectToKernelAuto = (enable: boolean) => ({
  type: CONNECT_TO_KERNEL.AUTO,
  enable,
});

const connectToKernelStart = (): EditorActionTypes => ({
  type: CONNECT_TO_KERNEL.START,
});

const connectToKernelSuccess = (kernel: IKernel): EditorActionTypes => ({
  type: CONNECT_TO_KERNEL.SUCCESS,
  kernel,
});

const connectToKernelFailure = (errorMessage: string): EditorActionTypes => ({
  type: CONNECT_TO_KERNEL.FAILURE,
  error: {
    message: errorMessage,
  },
});

const connectToKernelReconnecting = (): EditorActionTypes => ({
  type: CONNECT_TO_KERNEL.RECONNECTING,
});

const connectToKernelReconnected = (): EditorActionTypes => ({
  type: CONNECT_TO_KERNEL.RECONNECTED,
});

const connectToKernelDisconnected = (retry: boolean = true): EditorActionTypes => ({
  type: CONNECT_TO_KERNEL.DISCONNECTED,
  retry,
});

/**
 * Handle changes to the kernel status
 */
const monitorKernelStatus = (kernel: IKernel): EditorAsyncActionTypes => async (dispatch) => {
  let disconnected = false;

  kernel.statusChanged.connect((newKernel) => {
    if (newKernel.status === 'reconnecting') {
      disconnected = true;

      dispatch(
        _ui.notify({
          level: 'warning',
          title: 'Kernel connection lost',
          message:
            'The kernel disconnected, attempting to reconnect. If the kernel does not reconnect in the next couple minutes, the connection is dead.',
          duration: 5000,
        })
      );
      dispatch(
        appendKernelLog({
          status: 'Warning',
          message: `Kernel ${newKernel.id} connection lost`,
        })
      );

      dispatch(connectToKernelReconnecting());
    } else if (newKernel.status === 'dead') {
      dispatch(
        _ui.notify({
          level: 'error',
          title: 'Kernel connection died',
          message: 'Could not reconnect to the kernel after multiple tries. The connection is now dead.',
          duration: 5000,
        })
      );
      dispatch(
        appendKernelLog({
          status: 'Error',
          message: `Kernel ${newKernel.id} connection died`,
        })
      );

      dispatch(connectToKernelDisconnected());
    } else {
      if (disconnected) {
        disconnected = false;

        dispatch(
          _ui.notify({
            level: 'success',
            title: 'Kernel reconnected',
            message: 'The kernel reconnected, kernel state should be intact',
            duration: 5000,
          })
        );
        dispatch(
          appendKernelLog({
            status: 'Success',
            message: `Kernel ${newKernel.id} reconnected`,
          })
        );

        dispatch(connectToKernelReconnected());
      }
    }
  });
};

/**
 * Attempt to connect to the jupyter kernel gateway. In the future this can also hook into the hidden renderer
 */
export const connectToKernel = (uri: string, displayError = false): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(connectToKernelStart());

  const res = await jupyter.connectToKernel(uri);

  if (res.success) {
    dispatch(connectToKernelSuccess(res.kernel));

    dispatch(monitorKernelStatus(res.kernel));

    dispatch(
      appendKernelLog({
        status: 'Success',
        message: `Kernel ${res.kernel.id} connected`,
      })
    );
  } else {
    if (displayError) {
      dispatch(
        _ui.notify({
          level: 'error',
          title: "Couldn't connect to the kernel",
          message: res.error.message,
          duration: 5000,
        })
      );
    }

    dispatch(connectToKernelFailure(res.error.message));
  }
};

/**
 * Shutdown a live kernel or disconnect from a dying one.
 */
export const disconnectFromKernel = (kernel: IKernel): EditorAsyncActionTypes => async (dispatch) => {
  try {
    await kernel.shutdown();
  } catch (error) {
    kernel.dispose();
  }

  dispatch(
    appendKernelLog({
      status: 'Success',
      message: `Kernel ${kernel.id} disconnected`,
    })
  );

  dispatch(connectToKernelDisconnected(false));
};

const lockCellStart = (): EditorActionTypes => ({
  type: LOCK_CELL.START,
});

const lockCellSuccess = (isMe: boolean, uid: User['uid'], cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: LOCK_CELL.SUCCESS,
  isMe,
  uid,
  cell_id,
});

const lockCellFailure = (errorMessage: string): EditorActionTypes => ({
  type: LOCK_CELL.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to lock a given cell
 */
export const lockCell = (user: User, cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(lockCellStart());

  // TODO: make request
  dispatch(lockCellSuccess(true, user.uid, cell_id));
};

const unlockCellStart = (): EditorActionTypes => ({
  type: UNLOCK_CELL.START,
});

const unlockCellSuccess = (isMe: boolean, uid: User['uid'], cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: UNLOCK_CELL.SUCCESS,
  isMe,
  uid,
  cell_id,
});

const unlockCellFailure = (errorMessage: string) => ({
  type: UNLOCK_CELL.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to unlock the given cell
 */
export const unlockCell = (user: User, cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(unlockCellStart());

  // TODO: make request
  dispatch(unlockCellSuccess(true, user.uid, cell_id));
};

const addCellStart = (): EditorActionTypes => ({
  type: ADD_CELL.START,
});

const addCellSuccess = (isMe: boolean, cell_id: EditorCell['cell_id'], index: number): EditorActionTypes => ({
  type: ADD_CELL.SUCCESS,
  isMe,
  cell_id,
  index,
});

const addCellFailure = (errorMessage: string): EditorActionTypes => ({
  type: ADD_CELL.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to create a new cell at a given index. Use -1 to add to the end
 */
export const addCell = (index: number): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(addCellStart());

  // TODO: make request
  dispatch(addCellSuccess(true, `TODO-${uuid()}`, index));
};

const deleteCellStart = (): EditorActionTypes => ({
  type: DELETE_CELL.START,
});

const deleteCellSuccess = (isMe: boolean, cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: DELETE_CELL.SUCCESS,
  isMe,
  cell_id,
});

const deleteCellFailure = (errorMessage: string): EditorActionTypes => ({
  type: DELETE_CELL.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to delete a given cell
 */
export const deleteCell = (cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(deleteCellStart());

  // TODO: make request
  dispatch(deleteCellSuccess(true, cell_id));
};

const editCellStart = (): EditorActionTypes => ({
  type: EDIT_CELL.START,
});

const editCellSuccess = (
  isMe: boolean,
  cell_id: EditorCell['cell_id'],
  changes: Partial<EditorCell>
): EditorActionTypes => ({
  type: EDIT_CELL.SUCCESS,
  isMe,
  cell_id,
  changes,
});

const editCellFailure = (errorMessage: string): EditorActionTypes => {
  return {
    type: EDIT_CELL.FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

/**
 * Edit a cell locally and make a debounced socket request to update it remotely
 */
export const editCell = (
  cell_id: EditorCell['cell_id'],
  changes: Partial<EditorCell>
): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(editCellStart());

  // TODO: make debounced request
  dispatch(editCellSuccess(true, cell_id, changes));
};

const executeCodeStart = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: EXECUTE_CODE.START,
  cell_id,
});

const executeCodeSuccess = (cell_id: EditorCell['cell_id'], runIndex: number): EditorActionTypes => ({
  type: EXECUTE_CODE.SUCCESS,
  cell_id,
  runIndex,
});

const executeCodeFailure = (cell_id: EditorCell['cell_id'], errorMessage: string): EditorActionTypes => ({
  type: EXECUTE_CODE.FAILURE,
  cell_id,
  error: {
    message: errorMessage,
  },
});

const receiveKernelMessage = (cell_id: EditorCell['cell_id'], message: KernelOutput): EditorActionTypes => ({
  type: KERNEL_MESSAGE.RECEIVE,
  cell_id,
  message,
});

const updateRunIndex = (cell_id: EditorCell['cell_id'], runIndex: number): EditorActionTypes => ({
  type: KERNEL_MESSAGE.UPDATE_RUN_INDEX,
  cell_id,
  runIndex,
});

/**
 * Run code against the kernel and asynchronously process kernel messages
 */
export const executeCode = (user: User, kernel: IKernel, cell: EditorCell): EditorAsyncActionTypes => async (
  dispatch
) => {
  if (cell.language !== 'py' || cell.code.trim() === '') {
    return;
  }

  dispatch(executeCodeStart(cell.cell_id));

  const future = kernel.execute({
    code: cell.code,
  });

  let runIndex = -1;
  let messageIndex = 0;
  const messageQueue: KernelOutput[] = [];

  future.onIOPub = (message) => {
    let kernelOutput: KernelOutput | null = null;

    try {
      if (message.content.execution_count !== undefined && runIndex === -1) {
        // execution metadata
        runIndex = message.content.execution_count as number;

        // Update the current run
        dispatch(updateRunIndex(cell.cell_id, runIndex));
        dispatch(
          appendKernelLog({
            status: 'Info',
            message: `Started run #${runIndex} on cell ${cell.cell_id}`,
          })
        );
      }

      const baseKernelOutput: BaseKernelOutput = {
        uid: user.uid,
        output_id: message.header.msg_id,
        cell_id: cell.cell_id,
        runIndex: -1,
        messageIndex,
      };

      switch (message.header.msg_type) {
        case 'stream':
        case 'display_data':
        case 'execute_result':
        case 'error':
          kernelOutput = {
            ...baseKernelOutput,
            output: {
              ...((message.content as unknown) as IpynbOutput),
              output_type: message.header.msg_type,
            } as IpynbOutput,
          };
          break;
      }

      console.log({ message, kernelOutput });
    } catch (error) {
      console.error(error);
    }

    if (kernelOutput !== null) {
      messageIndex++;

      if (runIndex !== -1) {
        // No need to queue
        dispatch(
          receiveKernelMessage(cell.cell_id, {
            ...kernelOutput,
            runIndex,
          })
        );
      } else {
        // Store messages until execution count message is received
        messageQueue.push(kernelOutput);
      }
    } else if (runIndex !== -1 && messageQueue.length > 0) {
      // process any messages in queue
      for (const oldMessage of messageQueue) {
        dispatch(
          receiveKernelMessage(cell.cell_id, {
            ...oldMessage,
            runIndex,
          })
        );
      }
    }
  };

  await new Promise<void>((resolve) => {
    future.onDone = () => {
      resolve();
    };
  });

  dispatch(
    appendKernelLog({
      status: 'Success',
      message: `Finished run #${runIndex} on cell ${cell.cell_id}`,
    })
  );
  dispatch(executeCodeSuccess(cell.cell_id, runIndex));
};

/**
 * Triggered by a socket
 */
export const updateCellCode = (cell_id: EditorCell['cell_id'], code: string): EditorActionTypes => ({
  type: EDIT_CELL.UPDATE_CODE,
  cell_id,
  code,
});
