import { format } from 'date-fns';
import * as client from '@actually-colab/editor-client';

import { CELL, EditorActionTypes, EditorAsyncActionTypes, KERNEL, NOTEBOOKS } from '../../types/redux/editor';
import { User } from '../../types/user';
import { EditorCell, ImmutableEditorCell, KernelOutput } from '../../types/notebook';
import { Kernel, KernelLog } from '../../types/kernel';
import { _ui } from '.';

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

const connectToKernelStart = (uri: string, displayError: boolean): EditorActionTypes => ({
  type: KERNEL.CONNECT.START,
  uri,
  displayError,
});

export const connectToKernelSuccess = (kernel: Kernel): EditorActionTypes => ({
  type: KERNEL.CONNECT.SUCCESS,
  kernel,
});

export const connectToKernelFailure = (errorMessage: string): EditorActionTypes => ({
  type: KERNEL.CONNECT.FAILURE,
  error: {
    message: errorMessage,
  },
});

export const connectToKernelReconnecting = (): EditorActionTypes => ({
  type: KERNEL.CONNECT.RECONNECTING,
});

export const connectToKernelReconnected = (): EditorActionTypes => ({
  type: KERNEL.CONNECT.RECONNECTED,
});

const disconnectFromKernelStart = (retry: boolean = true): EditorActionTypes => ({
  type: KERNEL.DISCONNECT.START,
  retry,
});
export const disconnectFromKernelSuccess = (): EditorActionTypes => ({
  type: KERNEL.DISCONNECT.SUCCESS,
});

/**
 * Attempt to connect to the jupyter kernel gateway. In the future this can also hook into the hidden renderer
 */
export const connectToKernel = (uri: string, displayError = false): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(connectToKernelStart(uri, displayError));
};

const restartKernelStart = (): EditorActionTypes => ({
  type: KERNEL.RESTART.START,
});

export const restartKernelSuccess = (): EditorActionTypes => ({
  type: KERNEL.RESTART.SUCCESS,
});

/**
 * Restart the given kernel
 */
export const restartKernel = (gatewayUri: string, kernel: Kernel): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(restartKernelStart());
};

/**
 * Shutdown a live kernel or disconnect from a dying one.
 */
export const disconnectFromKernel = (): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(disconnectFromKernelStart(false));
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

/**
 * Open the notebook with the given id
 */
export const openNotebook = (nb_id: client.Notebook['nb_id']): EditorAsyncActionTypes => async (dispatch) => {
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
  cell_id: EditorCell['cell_id'],
  cell: Partial<EditorCell>
): EditorActionTypes => ({
  type: CELL.LOCK.SUCCESS,
  isMe,
  uid,
  cell_id,
  cell,
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
};

const unlockCellStart = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: CELL.UNLOCK.START,
  cell_id,
});

export const unlockCellSuccess = (
  isMe: boolean,
  uid: User['uid'],
  cell_id: EditorCell['cell_id'],
  cell: Partial<EditorCell>
): EditorActionTypes => ({
  type: CELL.UNLOCK.SUCCESS,
  isMe,
  uid,
  cell_id,
  cell,
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
};

const addCellStart = (index: number): EditorActionTypes => ({
  type: CELL.ADD.START,
  index,
});

export const addCellSuccess = (
  isMe: boolean,
  cell_id: EditorCell['cell_id'],
  index: number,
  cell: Partial<EditorCell>
): EditorActionTypes => ({
  type: CELL.ADD.SUCCESS,
  isMe,
  cell_id,
  index,
  cell,
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
};

const editCellStart = (cell_id: EditorCell['cell_id'], changes: Partial<EditorCell>): EditorActionTypes => ({
  type: CELL.EDIT.START,
  cell_id,
  changes,
});

export const editCellSuccess = (
  isMe: boolean,
  cell_id: EditorCell['cell_id'],
  cell: Required<client.DCell>
): EditorActionTypes => ({
  type: CELL.EDIT.SUCCESS,
  isMe,
  cell_id,
  cell,
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
  if (cell.get('language') !== 'python' || cell.get('contents').trim() === '') {
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

const executeCodeStart = (cell: ImmutableEditorCell): EditorActionTypes => ({
  type: KERNEL.EXECUTE.START,
  cell,
});

export const executeCodeSuccess = (cell_id: EditorCell['cell_id'], runIndex: number): EditorActionTypes => ({
  type: KERNEL.EXECUTE.SUCCESS,
  cell_id,
  runIndex,
});

export const executeCodeFailure = (
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

export const receiveKernelMessage = (cell_id: EditorCell['cell_id'], messages: KernelOutput[]): EditorActionTypes => ({
  type: KERNEL.MESSAGE.RECEIVE,
  cell_id,
  messages,
});

export const updateRunIndex = (cell_id: EditorCell['cell_id'], runIndex: number): EditorActionTypes => ({
  type: KERNEL.MESSAGE.UPDATE_RUN_INDEX,
  cell_id,
  runIndex,
});

/**
 * Run code against the kernel and asynchronously process kernel messages
 */
export const executeCode = (cell: ImmutableEditorCell): EditorAsyncActionTypes => async (dispatch) => {
  if (cell.get('language') !== 'python' || cell.get('contents').trim() === '') {
    return;
  }

  dispatch(executeCodeStart(cell));
};

const interruptKernelStart = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: KERNEL.INTERRUPT.START,
  cell_id,
});

export const interruptKernelSuccess = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: KERNEL.INTERRUPT.SUCCESS,
  cell_id,
});

/**
 * Interrupt the kernel execution
 */
export const stopCodeExecution = (cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(interruptKernelStart(cell_id));
};
