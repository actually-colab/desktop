import { IKernel } from 'jupyter-js-services';

import {
  CONNECT_TO_KERNEL_FAILURE,
  CONNECT_TO_KERNEL_START,
  CONNECT_TO_KERNEL_SUCCESS,
  EditorActionTypes,
  EditorAsyncActionTypes,
  EXECUTE_CODE_FAILURE,
  EXECUTE_CODE_START,
  EXECUTE_CODE_SUCCESS,
  RECEIVE_KERNEL_MESSAGE,
  UPDATE_CELL_CODE,
} from '../../types/redux/editor';
import { EditorCell, KernelOutput } from '../../types/notebook';
import * as jupyter from '../../kernel/jupyter';

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

const executeCodeStart = (cellId: string): EditorActionTypes => ({
  type: EXECUTE_CODE_START,
  cellId,
});

const executeCodeSuccess = (cellId: string): EditorActionTypes => ({
  type: EXECUTE_CODE_SUCCESS,
  cellId,
});

const executeCodeFailure = (cellId: string, errorMessage: string): EditorActionTypes => ({
  type: EXECUTE_CODE_FAILURE,
  cellId,
  error: {
    message: errorMessage,
  },
});

const receiveKernelMessage = (cellId: string, message: KernelOutput): EditorActionTypes => ({
  type: RECEIVE_KERNEL_MESSAGE,
  cellId,
  message,
});

/**
 * Run code against the kernel and asynchronously process kernel messages
 */
export const executeCode = (kernel: IKernel, cell: EditorCell): EditorAsyncActionTypes => async (dispatch) => {
  if (cell.language !== 'py') {
    return;
  }

  dispatch(executeCodeStart(cell._id));

  const future = kernel.execute({
    code: cell.code,
  });

  let runIndex = -1;
  let messageIndex = 0;
  const messageQueue: KernelOutput[] = [];

  future.onIOPub = (message) => {
    let kernelOutput: KernelOutput | null = null;

    try {
      if (message.content.execution_count !== undefined) {
        // execution metadata
        runIndex = message.content.execution_count as number;
      } else if (message.content.name === 'stdout') {
        // regular text stream
        kernelOutput = {
          _id: message.header.msg_id,
          cellId: cell._id,
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
          _id: message.header.msg_id,
          cellId: cell._id,
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
          receiveKernelMessage(cell._id, {
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
          receiveKernelMessage(cell._id, {
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

  dispatch(executeCodeSuccess(cell._id));
};

export const updateCellCode = (cellId: string, code: string): EditorActionTypes => ({
  type: UPDATE_CELL_CODE,
  cellId,
  code,
});
