import type { DCell, Notebook, NotebookAccessLevelType, NotebookContents, DUser } from '@actually-colab/editor-types';
import { format } from 'date-fns';

import { CELL, EditorActionTypes, EditorAsyncActionTypes, KERNEL, NOTEBOOKS } from '../../types/redux/editor';
import { EditorCell, EditorCellMeta, KernelOutput } from '../../types/notebook';
import { Kernel, KernelLog } from '../../types/kernel';
import { ImmutableEditorCell } from '../../immutable';

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
      dateString: format(date, 'pp'),
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
export const connectToKernelAuto = (enable: boolean): EditorActionTypes => ({
  type: KERNEL.CONNECT.AUTO,
  enable,
});

const connectToKernelStart = (uri: string, displayError: boolean): EditorActionTypes => ({
  type: KERNEL.CONNECT.START,
  uri,
  displayError,
});

/**
 * Successfully connected to a kernel
 */
export const connectToKernelSuccess = (kernel: Kernel): EditorActionTypes => ({
  type: KERNEL.CONNECT.SUCCESS,
  kernel,
});

/**
 * Failed to connect to a kernel
 */
export const connectToKernelFailure = (errorMessage: string): EditorActionTypes => ({
  type: KERNEL.CONNECT.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Reconnecting to a kernel
 */
export const connectToKernelReconnecting = (): EditorActionTypes => ({
  type: KERNEL.CONNECT.RECONNECTING,
});

/**
 * Reconnected to a kernel
 */
export const connectToKernelReconnected = (): EditorActionTypes => ({
  type: KERNEL.CONNECT.RECONNECTED,
});

const disconnectFromKernelStart = (retry: boolean = true): EditorActionTypes => ({
  type: KERNEL.DISCONNECT.START,
  retry,
});

/**
 * Successfully disconnected from a kernel
 */
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

/**
 * Successfully restarted a kernel
 */
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

/**
 * Successfully got the notebooks
 */
export const getNotebooksSuccess = (notebooks: Notebook[]): EditorActionTypes => ({
  type: NOTEBOOKS.GET.SUCCESS,
  notebooks,
});

/**
 * Failed to get the notebooks
 */
export const getNotebooksFailure = (errorMessage: string): EditorActionTypes => ({
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
};

const createNotebookStart = (name: string): EditorActionTypes => ({
  type: NOTEBOOKS.CREATE.START,
  name,
});

/**
 * Successfully created a notebook
 */
export const createNotebookSuccess = (notebook: Notebook): EditorActionTypes => ({
  type: NOTEBOOKS.CREATE.SUCCESS,
  notebook,
});

/**
 * Failed to create a notebook
 */
export const createNotebookFailure = (errorMessage: string): EditorActionTypes => ({
  type: NOTEBOOKS.CREATE.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Create a notebook with the given name
 */
export const createNotebook = (name: string): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(createNotebookStart(name));
};

const openNotebookStart = (nb_id: Notebook['nb_id']): EditorActionTypes => ({
  type: NOTEBOOKS.OPEN.START,
  nb_id,
});

/**
 * Successfully opened a notebook
 */
export const openNotebookSuccess = (notebook: NotebookContents): EditorActionTypes => ({
  type: NOTEBOOKS.OPEN.SUCCESS,
  notebook,
});

/**
 * Failed to open a notebook
 */
export const openNotebookFailure = (errorMessage: string): EditorActionTypes => ({
  type: NOTEBOOKS.OPEN.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Open the notebook with the given id
 */
export const openNotebook = (nb_id: Notebook['nb_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(openNotebookStart(nb_id));
};

const shareNotebookStart = (
  nb_id: Notebook['nb_id'],
  email: string,
  access_level: NotebookAccessLevelType
): EditorActionTypes => ({
  type: NOTEBOOKS.SHARE.START,
  nb_id,
  email,
  access_level,
});

/**
 * Successfully shared a notebook
 */
export const shareNotebookSuccess = (notebook: Notebook): EditorActionTypes => ({
  type: NOTEBOOKS.SHARE.SUCCESS,
  notebook,
});

/**
 * Failed to share a notebook
 */
export const shareNotebooksFailure = (errorMessage: string): EditorActionTypes => ({
  type: NOTEBOOKS.SHARE.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Share a notebook with a given user
 */
export const shareNotebook = (
  nb_id: Notebook['nb_id'],
  email: string,
  access_level: NotebookAccessLevelType
): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(shareNotebookStart(nb_id, email, access_level));
};

const lockCellStart = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: CELL.LOCK.START,
  cell_id,
});

/**
 * Successfully locked a cell
 */
export const lockCellSuccess = (
  isMe: boolean,
  uid: DUser['uid'],
  cell_id: EditorCell['cell_id'],
  cell: Partial<EditorCell>
): EditorActionTypes => ({
  type: CELL.LOCK.SUCCESS,
  isMe,
  uid,
  cell_id,
  cell,
});

/**
 * Failed to lock a cell
 */
export const lockCellFailure = (errorMessage: string): EditorActionTypes => ({
  type: CELL.LOCK.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to lock a given cell
 */
export const lockCell = (user: DUser, cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(lockCellStart(cell_id));
  dispatch(selectCell(cell_id));
};

const unlockCellStart = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: CELL.UNLOCK.START,
  cell_id,
});

/**
 * Successfully unlocked a cell
 */
export const unlockCellSuccess = (
  isMe: boolean,
  uid: DUser['uid'],
  cell_id: EditorCell['cell_id'],
  cell: Partial<EditorCell>
): EditorActionTypes => ({
  type: CELL.UNLOCK.SUCCESS,
  isMe,
  uid,
  cell_id,
  cell,
});

/**
 * Failed to unlock a cell
 */
export const unlockCellFailure = (errorMessage: string): EditorActionTypes => ({
  type: CELL.UNLOCK.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to unlock the given cell
 */
export const unlockCell = (user: DUser, cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(unlockCellStart(cell_id));
};

const addCellStart = (index: number): EditorActionTypes => ({
  type: CELL.ADD.START,
  index,
});

/**
 * Successfully added a new cell
 */
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

/**
 * Failed to add a new cell
 */
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

/**
 * Successfully deleted a cell
 */
export const deleteCellSuccess = (isMe: boolean, cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: CELL.DELETE.SUCCESS,
  isMe,
  cell_id,
});

/**
 * Failed to delete a cell
 */
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

const editCellStart = (
  cell_id: EditorCell['cell_id'],
  changes?: Partial<DCell>,
  metaChanges?: Partial<EditorCellMeta>
): EditorActionTypes => ({
  type: CELL.EDIT.START,
  cell_id,
  changes,
  metaChanges,
});

/**
 * Successfully edited a cell
 */
export const editCellSuccess = (
  isMe: boolean,
  cell_id: EditorCell['cell_id'],
  cell: Required<DCell>
): EditorActionTypes => ({
  type: CELL.EDIT.SUCCESS,
  isMe,
  cell_id,
  cell,
});

/**
 * Failed to edit a cell
 */
export const editCellFailure = (errorMessage: string): EditorActionTypes => {
  return {
    type: CELL.EDIT.FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

/**
 * Updates to DCell and Metadata properties
 */
export type EditCellUpdates = {
  changes?: Partial<DCell>;
  metaChanges?: Partial<EditorCellMeta>;
};

/**
 * Edit a cell locally and make a debounced socket request to update it remotely
 */
export const editCell = (cell_id: EditorCell['cell_id'], updates: EditCellUpdates): EditorAsyncActionTypes => async (
  dispatch
) => {
  dispatch(editCellStart(cell_id, updates.changes, updates.metaChanges));
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
  if (cell.language !== 'python' || cell.contents.trim() === '') {
    return;
  }

  dispatch(
    appendKernelLog({
      status: 'Info',
      message: `Queued cell ${cell.cell_id}`,
    })
  );

  dispatch(executeCodeQueue(cell.cell_id));
};

const executeCodeStart = (cell: ImmutableEditorCell): EditorActionTypes => ({
  type: KERNEL.EXECUTE.START,
  cell,
});

/**
 * Successfully executed a cell
 */
export const executeCodeSuccess = (cell_id: EditorCell['cell_id'], runIndex: number): EditorActionTypes => ({
  type: KERNEL.EXECUTE.SUCCESS,
  cell_id,
  runIndex,
});

/**
 * Failed to execute a cell (or ran into an error)
 */
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

/**
 * Received a message from the kernel
 */
export const receiveKernelMessage = (cell_id: EditorCell['cell_id'], messages: KernelOutput[]): EditorActionTypes => ({
  type: KERNEL.MESSAGE.RECEIVE,
  cell_id,
  messages,
});

/**
 * Update the run index for a cell
 */
export const updateRunIndex = (cell_id: EditorCell['cell_id'], runIndex: number): EditorActionTypes => ({
  type: KERNEL.MESSAGE.UPDATE_RUN_INDEX,
  cell_id,
  runIndex,
});

/**
 * Run code against the kernel and asynchronously process kernel messages
 */
export const executeCode = (cell: ImmutableEditorCell): EditorAsyncActionTypes => async (dispatch) => {
  if (cell.language !== 'python' || cell.contents.trim() === '') {
    return;
  }

  dispatch(executeCodeStart(cell));
};

const interruptKernelStart = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: KERNEL.INTERRUPT.START,
  cell_id,
});

/**
 * Successfully interrupted a kernel
 */
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
