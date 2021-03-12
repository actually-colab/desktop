import { IKernel } from 'jupyter-js-services';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import * as client from '@actually-colab/editor-client';

import { CELL, EditorActionTypes, EditorAsyncActionTypes, KERNEL, NOTEBOOKS } from '../../types/redux/editor';
import { User } from '../../types/user';
import { IpynbOutput } from '../../types/ipynb';
import { BaseKernelOutput, EditorCell, ImmutableEditorCell, KernelOutput } from '../../types/notebook';
import { _ui } from '.';
import { KernelLog } from '../../types/kernel';
import { KernelApi } from '../../api';
import { EXAMPLE_PROJECT } from '../../constants/demo';

/**
 * Add a new log message
 */
export const appendKernelLog = (log: Omit<KernelLog, 'id' | 'date'>): EditorActionTypes => {
  const date = new Date();

  return {
    type: KERNEL.LOG.APPEND,
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
  type: KERNEL.LOG.CLEAR,
});

/**
 * Set the kernel gateway uri
 */
export const setKernelGateway = (uri: string): EditorActionTypes => ({
  type: KERNEL.GATEWAY.SET,
  uri,
});

/**
 * Set if editing the kernel gateway URI
 */
export const editKernelGateway = (editing: boolean): EditorActionTypes => ({
  type: KERNEL.GATEWAY.EDIT,
  editing,
});

/**
 * Enable or disable connecting to the kernel automatically
 */
export const connectToKernelAuto = (enable: boolean) => ({
  type: KERNEL.CONNECT.AUTO,
  enable,
});

const connectToKernelStart = (): EditorActionTypes => ({
  type: KERNEL.CONNECT.START,
});

const connectToKernelSuccess = (kernel: IKernel): EditorActionTypes => ({
  type: KERNEL.CONNECT.SUCCESS,
  kernel,
});

const connectToKernelFailure = (errorMessage: string): EditorActionTypes => ({
  type: KERNEL.CONNECT.FAILURE,
  error: {
    message: errorMessage,
  },
});

const connectToKernelReconnecting = (): EditorActionTypes => ({
  type: KERNEL.CONNECT.RECONNECTING,
});

const connectToKernelReconnected = (): EditorActionTypes => ({
  type: KERNEL.CONNECT.RECONNECTED,
});

const connectToKernelDisconnected = (retry: boolean = true): EditorActionTypes => ({
  type: KERNEL.CONNECT.DISCONNECTED,
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

  const res = await KernelApi.connectToKernel(uri);

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

const connectToKernelRestarted = (): EditorActionTypes => ({
  type: KERNEL.CONNECT.RESTARTED,
});

/**
 * Restart the given kernel
 */
export const restartKernel = (gatewayUri: string, kernel: IKernel): EditorAsyncActionTypes => async (dispatch) => {
  try {
    await KernelApi.restart(gatewayUri, kernel);

    console.log('Kernel was restarted');
    dispatch(connectToKernelRestarted());
  } catch (error) {
    console.error(error);
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

const getNotebooksStart = (): EditorActionTypes => ({
  type: NOTEBOOKS.GET.START,
});

const getNotebooksSuccess = (notebooks: client.Notebook[]): EditorActionTypes => ({
  type: NOTEBOOKS.GET.SUCCESS,
  notebooks,
});

const getNotebooksFailure = (errorMessage: string): EditorActionTypes => ({
  type: NOTEBOOKS.GET.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Get a list of notebooks for the current user
 */
export const getNotebooks = (): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(getNotebooksStart());

  try {
    const notebooks = await client.getNotebooksForUser();

    dispatch(getNotebooksSuccess(notebooks));
  } catch (error) {
    console.error(error);
    dispatch(getNotebooksFailure(error.message));
    dispatch(
      _ui.notify({
        level: 'error',
        title: 'Error',
        message: 'Failed to get your notebooks!',
        duration: 3000,
      })
    );
  }
};

const createNotebookStart = (): EditorActionTypes => ({
  type: NOTEBOOKS.CREATE.START,
});

const createNotebookSuccess = (notebook: client.Notebook): EditorActionTypes => ({
  type: NOTEBOOKS.CREATE.SUCCESS,
  notebook,
});

const createNotebookFailure = (errorMessage: string): EditorActionTypes => ({
  type: NOTEBOOKS.CREATE.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Create a notebook with the given name
 */
export const createNotebook = (name: string): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(createNotebookStart());

  try {
    const notebook = await client.createNotebook(name);

    dispatch(createNotebookSuccess(notebook));
  } catch (error) {
    console.error(error);
    dispatch(createNotebookFailure(error.message));
    dispatch(
      _ui.notify({
        level: 'error',
        title: 'Error',
        message: 'Failed to create your notebook!',
        duration: 3000,
      })
    );
  }
};

const openNotebookStart = (nb_id: client.Notebook['nb_id']): EditorActionTypes => ({
  type: NOTEBOOKS.OPEN.START,
  nb_id,
});

const openNotebookSuccess = (notebook: client.NotebookContents): EditorActionTypes => ({
  type: NOTEBOOKS.OPEN.SUCCESS,
  notebook,
});

const openNotebookFailure = (errorMessage: string): EditorActionTypes => ({
  type: NOTEBOOKS.OPEN.FAILURE,
  error: {
    message: errorMessage,
  },
});

const openNotebookDemo = (): EditorActionTypes => ({
  type: NOTEBOOKS.OPEN.DEMO,
});

/**
 * Open the notebook with the given id
 */
export const openNotebook = (nb_id: client.Notebook['nb_id']): EditorAsyncActionTypes => async (dispatch) => {
  if (nb_id === EXAMPLE_PROJECT.nb_id) {
    dispatch(openNotebookDemo());
    return;
  }

  dispatch(openNotebookStart(nb_id));

  try {
    const notebook = await client.getNotebookContents(nb_id);

    dispatch(openNotebookSuccess(notebook));
  } catch (error) {
    console.error(error);
    dispatch(openNotebookFailure(error.message));
    dispatch(
      _ui.notify({
        level: 'error',
        title: 'Error',
        message: 'Failed to open your notebook!',
        duration: 3000,
      })
    );
  }
};

const lockCellStart = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: CELL.LOCK.START,
  cell_id,
});

export const lockCellSuccess = (
  isMe: boolean,
  uid: User['uid'],
  cell_id: EditorCell['cell_id']
): EditorActionTypes => ({
  type: CELL.LOCK.SUCCESS,
  isMe,
  uid,
  cell_id,
});

export const lockCellFailure = (errorMessage: string): EditorActionTypes => ({
  type: CELL.LOCK.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to lock a given cell
 */
export const lockCell = (user: User, cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(lockCellStart(cell_id));
  dispatch(selectCell(cell_id));

  if (cell_id.startsWith('DEMO')) {
    dispatch(lockCellSuccess(true, user.uid, cell_id));
  }
};

const unlockCellStart = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: CELL.UNLOCK.START,
  cell_id,
});

export const unlockCellSuccess = (
  isMe: boolean,
  uid: User['uid'],
  cell_id: EditorCell['cell_id']
): EditorActionTypes => ({
  type: CELL.UNLOCK.SUCCESS,
  isMe,
  uid,
  cell_id,
});

export const unlockCellFailure = (errorMessage: string) => ({
  type: CELL.UNLOCK.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to unlock the given cell
 */
export const unlockCell = (user: User, cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(unlockCellStart(cell_id));

  // TODO: make request
  if (cell_id.startsWith('DEMO')) {
    dispatch(unlockCellSuccess(true, user.uid, cell_id));
  }
};

const addCellStart = (index: number): EditorActionTypes => ({
  type: CELL.ADD.START,
  index,
});

export const addCellSuccess = (isMe: boolean, cell_id: EditorCell['cell_id'], index: number): EditorActionTypes => ({
  type: CELL.ADD.SUCCESS,
  isMe,
  cell_id,
  index,
});

export const addCellFailure = (errorMessage: string): EditorActionTypes => ({
  type: CELL.ADD.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to create a new cell at a given index. Use -1 to add to the end
 */
export const addCell = (index: number): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(addCellStart(index));
};

const deleteCellStart = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: CELL.DELETE.START,
  cell_id,
});

export const deleteCellSuccess = (isMe: boolean, cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: CELL.DELETE.SUCCESS,
  isMe,
  cell_id,
});

export const deleteCellFailure = (errorMessage: string): EditorActionTypes => ({
  type: CELL.DELETE.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to delete a given cell
 */
export const deleteCell = (cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(deleteCellStart(cell_id));

  // TODO: make request
  if (cell_id.startsWith('DEMO')) {
    dispatch(deleteCellSuccess(true, cell_id));
  }
};

const editCellStart = (cell_id: EditorCell['cell_id'], changes: Partial<EditorCell>): EditorActionTypes => ({
  type: CELL.EDIT.START,
  cell_id,
  changes,
});

export const editCellSuccess = (
  isMe: boolean,
  cell_id: EditorCell['cell_id'],
  changes: Partial<EditorCell>
): EditorActionTypes => ({
  type: CELL.EDIT.SUCCESS,
  isMe,
  cell_id,
  changes,
});

export const editCellFailure = (errorMessage: string): EditorActionTypes => {
  return {
    type: CELL.EDIT.FAILURE,
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
  dispatch(editCellStart(cell_id, changes));

  // TODO: make debounced request
  if (cell_id.startsWith('DEMO')) {
    dispatch(editCellSuccess(true, cell_id, changes));
  }
};

/**
 * Triggered by a socket
 */
export const updateCellCode = (cell_id: EditorCell['cell_id'], code: string): EditorActionTypes => ({
  type: CELL.EDIT.UPDATE_CODE,
  cell_id,
  code,
});

/**
 * Select a given cell for running
 */
export const selectCell = (cell_id: string): EditorActionTypes => ({
  type: CELL.SELECT.SET,
  cell_id,
});

/**
 * Select the next cell
 */
export const selectNextCell = (): EditorActionTypes => ({
  type: CELL.SELECT.NEXT,
});

const executeCodeQueue = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: KERNEL.EXECUTE.QUEUE,
  cell_id,
});

/**
 * Add a cell to the execution queue
 */
export const addCellToQueue = (cell: ImmutableEditorCell): EditorAsyncActionTypes => async (dispatch) => {
  if (cell.get('language') !== 'python3' || cell.get('contents').trim() === '') {
    return;
  }

  dispatch(
    appendKernelLog({
      status: 'Info',
      message: `Added cell ${cell.get('cell_id')} to queue`,
    })
  );

  dispatch(executeCodeQueue(cell.get('cell_id')));
};

const executeCodeStart = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: KERNEL.EXECUTE.START,
  cell_id,
});

const executeCodeSuccess = (cell_id: EditorCell['cell_id'], runIndex: number): EditorActionTypes => ({
  type: KERNEL.EXECUTE.SUCCESS,
  cell_id,
  runIndex,
});

const executeCodeFailure = (
  cell_id: EditorCell['cell_id'],
  runIndex: number,
  errorMessage: string
): EditorActionTypes => ({
  type: KERNEL.EXECUTE.FAILURE,
  cell_id,
  runIndex,
  error: {
    message: errorMessage,
  },
});

const receiveKernelMessage = (cell_id: EditorCell['cell_id'], messages: KernelOutput[]): EditorActionTypes => ({
  type: KERNEL.MESSAGE.RECEIVE,
  cell_id,
  messages,
});

const updateRunIndex = (cell_id: EditorCell['cell_id'], runIndex: number): EditorActionTypes => ({
  type: KERNEL.MESSAGE.UPDATE_RUN_INDEX,
  cell_id,
  runIndex,
});

/**
 * Run code against the kernel and asynchronously process kernel messages
 */
export const executeCode = (user: User, kernel: IKernel, cell: ImmutableEditorCell): EditorAsyncActionTypes => async (
  dispatch
) => {
  if (cell.get('language') !== 'python3' || cell.get('contents').trim() === '') {
    return;
  }

  dispatch(executeCodeStart(cell.get('cell_id')));

  const future = kernel.execute({
    code: cell.get('contents'),
  });

  let runIndex = -1;
  let messageIndex = 0;
  const messageQueue: KernelOutput[] = [];
  let threwError = false;

  future.onIOPub = (message) => {
    let kernelOutput: KernelOutput | null = null;

    try {
      if (message.content.execution_count !== undefined && runIndex === -1) {
        // execution metadata
        runIndex = message.content.execution_count as number;

        // Update the current run
        dispatch(updateRunIndex(cell.get('cell_id'), runIndex));
        dispatch(
          appendKernelLog({
            status: 'Info',
            message: `Started run #${runIndex} on cell ${cell.get('cell_id')}`,
          })
        );
      }

      const baseKernelOutput: BaseKernelOutput = {
        uid: user.uid,
        output_id: message.header.msg_id,
        cell_id: cell.get('cell_id'),
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

      if (message.header.msg_type === 'error') {
        threwError = true;
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
          receiveKernelMessage(cell.get('cell_id'), [
            {
              ...kernelOutput,
              runIndex,
            },
          ])
        );
      } else {
        // Store messages until execution count message is received
        messageQueue.push(kernelOutput);
      }
    } else if (runIndex !== -1 && messageQueue.length > 0) {
      // process any messages in queue
      dispatch(
        receiveKernelMessage(
          cell.get('cell_id'),
          messageQueue.map((oldMessage) => ({ ...oldMessage, runIndex }))
        )
      );
    }
  };

  await new Promise<void>((resolve) => {
    future.onDone = () => {
      resolve();
    };
  });

  dispatch(
    appendKernelLog({
      status: threwError ? 'Error' : 'Success',
      message: `Finished run #${runIndex} on cell ${cell.get('cell_id')}`,
    })
  );

  if (threwError) {
    dispatch(executeCodeFailure(cell.get('cell_id'), runIndex, 'Code threw an error'));
  } else {
    dispatch(executeCodeSuccess(cell.get('cell_id'), runIndex));
  }
};

const executeCodeStopped = (cell: ImmutableEditorCell): EditorActionTypes => ({
  type: KERNEL.EXECUTE.STOPPED,
  cell_id: cell.get('cell_id'),
});

/**
 * Interrupt the kernel execution
 */
export const stopCodeExecution = (
  gatewayUri: string,
  kernel: IKernel,
  cell: ImmutableEditorCell
): EditorAsyncActionTypes => async (dispatch) => {
  try {
    await KernelApi.interrupt(gatewayUri, kernel);

    console.log('Kernel was interrupted');
    dispatch(executeCodeStopped(cell));
  } catch (error) {
    console.error(error);
  }
};
