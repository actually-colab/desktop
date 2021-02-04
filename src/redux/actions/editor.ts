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
} from '../types/editor';
import * as jupyter from '../../kernel/jupyter';
import { EditorCell, KernelOutput } from '../../kernel/types';

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

export const executeCode = (kernel: IKernel, cell: EditorCell): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(executeCodeStart(cell._id));

  const future = kernel.execute({
    code: cell.code,
  });

  future.onIOPub = (message) => {
    let kernelOutput: KernelOutput | null = null;

    try {
      if (message.content.name === 'stdout') {
        kernelOutput = {
          _id: message.header.msg_id,
          name: 'stdout',
          data: {
            text: message.content.text as string,
          },
        };
      } else if (message.header.msg_type === 'display_data') {
        kernelOutput = {
          _id: message.header.msg_id,
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
      dispatch(receiveKernelMessage(cell._id, kernelOutput));
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
