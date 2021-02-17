import { IKernel } from 'jupyter-js-services';
import { v4 as uuid } from 'uuid';

import {
  ADD_CELL_FAILURE,
  ADD_CELL_START,
  ADD_CELL_SUCCESS,
  CONNECT_TO_KERNEL_FAILURE,
  CONNECT_TO_KERNEL_START,
  CONNECT_TO_KERNEL_SUCCESS,
  DELETE_CELL_FAILURE,
  DELETE_CELL_START,
  DELETE_CELL_SUCCESS,
  EditorActionTypes,
  EditorAsyncActionTypes,
  EDIT_CELL_FAILURE,
  EDIT_CELL_START,
  EDIT_CELL_SUCCESS,
  EXECUTE_CODE_FAILURE,
  EXECUTE_CODE_START,
  EXECUTE_CODE_SUCCESS,
  LOCK_CELL_FAILURE,
  LOCK_CELL_START,
  LOCK_CELL_SUCCESS,
  RECEIVE_KERNEL_MESSAGE,
  UNLOCK_CELL_FAILURE,
  UNLOCK_CELL_START,
  UNLOCK_CELL_SUCCESS,
  UPDATE_CELL_CODE,
} from '../../types/redux/editor';
import { EditorCell, KernelOutput } from '../../types/notebook';
import * as jupyter from '../../kernel/jupyter';
import { displayError } from '../../utils/ipc';

const connectToKernelStart = (): EditorActionTypes => ({
  type: CONNECT_TO_KERNEL_START,
});

const connectToKernelSuccess = (kernel: IKernel): EditorActionTypes => ({
  type: CONNECT_TO_KERNEL_SUCCESS,
  kernel,
});

const connectToKernelFailure = (errorMessage: string): EditorActionTypes => ({
  type: CONNECT_TO_KERNEL_FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Attempt to connect to the jupyter kernel gateway. In the future this can also hook into the hidden renderer
 */
export const connectToKernel = (): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(connectToKernelStart());

  const res = await jupyter.connectToKernel();

  if (res.success) {
    dispatch(connectToKernelSuccess(res.kernel));
  } else {
    dispatch(connectToKernelFailure(res.error.message));
  }
};

const lockCellStart = (): EditorActionTypes => ({
  type: LOCK_CELL_START,
});

const lockCellSuccess = (isMe: boolean, uid: string, cell_id: string): EditorActionTypes => ({
  type: LOCK_CELL_SUCCESS,
  isMe,
  uid,
  cell_id,
});

const lockCellFailure = (errorMessage: string): EditorActionTypes => {
  displayError(errorMessage);

  return {
    type: LOCK_CELL_FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

/**
 * Try to lock a given cell
 */
export const lockCell = (cell_id: string): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(lockCellStart());

  // TODO: make request
  dispatch(lockCellSuccess(true, 'jeff@test.com', cell_id));
};

const unlockCellStart = (): EditorActionTypes => ({
  type: UNLOCK_CELL_START,
});

const unlockCellSuccess = (isMe: boolean, uid: string, cell_id: string): EditorActionTypes => ({
  type: UNLOCK_CELL_SUCCESS,
  isMe,
  uid,
  cell_id,
});

const unlockCellFailure = (errorMessage: string) => {
  displayError(errorMessage);

  return {
    type: UNLOCK_CELL_FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

/**
 * Try to unlock the given cell
 */
export const unlockCell = (cell_id: string): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(unlockCellStart());

  // TODO: make request
  dispatch(unlockCellSuccess(true, 'jeff@test.com', cell_id));
};

const addCellStart = (): EditorActionTypes => ({
  type: ADD_CELL_START,
});

const addCellSuccess = (isMe: boolean, cell_id: string, index: number): EditorActionTypes => ({
  type: ADD_CELL_SUCCESS,
  isMe,
  cell_id,
  index,
});

const addCellFailure = (errorMessage: string): EditorActionTypes => {
  displayError(errorMessage);

  return {
    type: ADD_CELL_FAILURE,
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
  type: DELETE_CELL_START,
});

const deleteCellSuccess = (isMe: boolean, cell_id: string): EditorActionTypes => ({
  type: DELETE_CELL_SUCCESS,
  isMe,
  cell_id,
});

const deleteCellFailure = (errorMessage: string): EditorActionTypes => {
  displayError(errorMessage);

  return {
    type: DELETE_CELL_FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

/**
 * Try to delete a given cell
 */
export const deleteCell = (cell_id: string): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(deleteCellStart());

  // TODO: make request
  dispatch(deleteCellSuccess(true, cell_id));
};

const editCellStart = (): EditorActionTypes => ({
  type: EDIT_CELL_START,
});

const editCellSuccess = (isMe: boolean, cell_id: string, changes: Partial<EditorCell>): EditorActionTypes => ({
  type: EDIT_CELL_SUCCESS,
  isMe,
  cell_id,
  changes,
});

const editCellFailure = (errorMessage: string): EditorActionTypes => {
  displayError(errorMessage);

  return {
    type: EDIT_CELL_FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

/**
 * Edit a cell locally and make a debounced socket request to update it remotely
 */
export const editCell = (cell_id: string, changes: Partial<EditorCell>): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(editCellStart());

  // TODO: make debounced request
  dispatch(editCellSuccess(true, cell_id, changes));
};

const executeCodeStart = (cell_id: string): EditorActionTypes => ({
  type: EXECUTE_CODE_START,
  cell_id,
});

const executeCodeSuccess = (cell_id: string, runIndex: number): EditorActionTypes => ({
  type: EXECUTE_CODE_SUCCESS,
  cell_id,
  runIndex,
});

const executeCodeFailure = (cell_id: string, errorMessage: string): EditorActionTypes => ({
  type: EXECUTE_CODE_FAILURE,
  cell_id,
  error: {
    message: errorMessage,
  },
});

const receiveKernelMessage = (cell_id: string, message: KernelOutput): EditorActionTypes => ({
  type: RECEIVE_KERNEL_MESSAGE,
  cell_id,
  message,
});

/**
 * Run code against the kernel and asynchronously process kernel messages
 */
export const executeCode = (kernel: IKernel, cell: EditorCell): EditorAsyncActionTypes => async (dispatch) => {
  if (cell.language !== 'py') {
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
      } else if (message.content.name === 'stdout') {
        // regular text stream
        kernelOutput = {
          uid: 'jeff@test.com', // TODO
          output_id: message.header.msg_id,
          cell_id: cell.cell_id,
          runIndex: -1,
          messageIndex,
          name: 'stdout',
          data: {
            text: message.content.text as string,
          },
        };
      } else if (message.header.msg_type === 'display_data') {
        // image content
        kernelOutput = {
          uid: 'jeff@test.com', // TODO
          output_id: message.header.msg_id,
          cell_id: cell.cell_id,
          runIndex: -1,
          messageIndex,
          name: 'display_data',
          data: {
            text: (message.content.data as any)['text/plain'],
            image: (message.content.data as any)['image/png'],
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

export const updateCellCode = (cell_id: string, code: string): EditorActionTypes => ({
  type: UPDATE_CELL_CODE,
  cell_id,
  code,
});
