import { IKernel } from 'jupyter-js-services';
import { v4 as uuid } from 'uuid';

import {
  ADD_CELL,
  CONNECT_TO_KERNEL,
  DELETE_CELL,
  EditorActionTypes,
  EditorAsyncActionTypes,
  EDIT_CELL,
  EXECUTE_CODE,
  KERNEL_GATEWAY,
  KERNEL_MESSAGE,
  LOCK_CELL,
  UNLOCK_CELL,
} from '../../types/redux/editor';
import { User } from '../../types/user';
import { EditorCell, KernelOutput } from '../../types/notebook';
import * as jupyter from '../../kernel/jupyter';

/**
 * Set the kernel gateway uri
 */
export const setKernelGateway = (uri: string): EditorActionTypes => ({
  type: KERNEL_GATEWAY.SET,
  uri,
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

/**
 * Attempt to connect to the jupyter kernel gateway. In the future this can also hook into the hidden renderer
 */
export const connectToKernel = (uri: string): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(connectToKernelStart());

  const res = await jupyter.connectToKernel(uri);

  if (res.success) {
    dispatch(connectToKernelSuccess(res.kernel));
  } else {
    dispatch(connectToKernelFailure(res.error.message));
  }
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

const lockCellFailure = (errorMessage: string): EditorActionTypes => {
  return {
    type: LOCK_CELL.FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

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

const unlockCellFailure = (errorMessage: string) => {
  return {
    type: UNLOCK_CELL.FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

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

const addCellFailure = (errorMessage: string): EditorActionTypes => {
  return {
    type: ADD_CELL.FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

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

const deleteCellFailure = (errorMessage: string): EditorActionTypes => {
  return {
    type: DELETE_CELL.FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

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

    console.log(message);

    try {
      if (message.content.execution_count !== undefined) {
        // execution metadata
        runIndex = message.content.execution_count as number;

        // Update the current run
        dispatch(updateRunIndex(cell.cell_id, runIndex));
      } else if (message.content.name === 'stdout') {
        // regular text stream
        kernelOutput = {
          uid: user.uid, // TODO
          output_id: message.header.msg_id,
          cell_id: cell.cell_id,
          runIndex: -1,
          messageIndex,
          channel: 'stdout',
          data: {
            text: message.content.text as string,
          },
        };
      } else if (message.header.msg_type === 'display_data') {
        // image content
        kernelOutput = {
          uid: user.uid, // TODO
          output_id: message.header.msg_id,
          cell_id: cell.cell_id,
          runIndex: -1,
          messageIndex,
          channel: 'display_data',
          data: {
            text: (message.content.data as any)['text/plain'],
            image: (message.content.data as any)['image/png'],
          },
        };
      } else if (message.header.msg_type === 'error') {
        // error
        kernelOutput = {
          uid: user.uid,
          output_id: message.header.msg_id,
          cell_id: cell.cell_id,
          runIndex: -1,
          messageIndex,
          channel: 'stderr',
          data: {
            ename: message.content.ename as string,
            evalue: message.content.evalue as string,
            traceback: message.content.traceback as string[],
          },
        };
      }
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
