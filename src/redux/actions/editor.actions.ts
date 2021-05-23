import type {
  DCell,
  Notebook,
  NotebookAccessLevelType,
  NotebookContents,
  DUser,
  OOutput,
  Workshop,
  NotebookAccessLevel,
  WorkshopAccessLevelType,
  OChatMessage,
} from '@actually-colab/editor-types';
import { format } from 'date-fns';

import {
  CELL,
  CLIENT,
  CONTACTS,
  EditorActionTypes,
  EditorAsyncActionTypes,
  KERNEL,
  NOTEBOOKS,
  WORKSHOPS,
} from '../../types/redux/editor';
import { EditorCell, EditorCellMeta, KernelOutput } from '../../types/notebook';
import { Kernel, KernelLog } from '../../types/kernel';
import { ImmutableEditorCell } from '../../immutable';
import { KernelAutoConnectStorage, RecentUsersStorage } from '../../utils/storage';

/**
 * Started connecting to the client socket
 */
export const connectToClientStart = (): EditorActionTypes => ({
  type: CLIENT.CONNECT.START,
});

/**
 * Successfully connected to the client socket
 */
export const connectToClientSuccess = (): EditorActionTypes => ({
  type: CLIENT.CONNECT.SUCCESS,
});

/**
 * Failed to connect to the client socket
 */
export const connectToClientFailure = (): EditorActionTypes => ({
  type: CLIENT.CONNECT.FAILURE,
});

const getContactsSuccess = (contacts: DUser['email'][]): EditorActionTypes => ({
  type: CONTACTS.GET.SUCCESS,
  contacts,
});

/**
 * Get contacts from local storage
 */
export const getContacts = (): EditorAsyncActionTypes => async (dispatch) => {
  const contacts = RecentUsersStorage.get();

  dispatch(getContactsSuccess(contacts));
};

const setContactsSuccess = (contacts: DUser['email'][]): EditorActionTypes => ({
  type: CONTACTS.SET.SUCCESS,
  contacts,
});

/**
 * Set contacts in local storage
 */
export const setContacts = (contacts: DUser['email'][]): EditorAsyncActionTypes => async (dispatch) => {
  RecentUsersStorage.set(contacts);

  dispatch(setContactsSuccess(contacts));
};

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
export const setKernelGateway = ({ uri, token }: { uri?: string; token?: string }): EditorActionTypes => ({
  type: KERNEL.GATEWAY.SET,
  uri,
  token,
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
export const connectToKernelAuto = (enable: boolean): EditorActionTypes => {
  KernelAutoConnectStorage.set(enable ? 'on' : 'off');

  return {
    type: KERNEL.CONNECT.AUTO,
    enable,
  };
};

const connectToKernelStart = (uri: string, token: string, displayError: boolean): EditorActionTypes => ({
  type: KERNEL.CONNECT.START,
  uri,
  token,
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
export const connectToKernelFailure = (errorMessage: string = 'Unknown Error'): EditorActionTypes => ({
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
 * Attempt to connect to the jupyter kernel gateway
 */
export const connectToKernel = (uri: string, token: string, displayError = false): EditorAsyncActionTypes => async (
  dispatch
) => {
  dispatch(connectToKernelStart(uri, token, displayError));
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
export const getNotebooksFailure = (errorMessage: string = 'Unknown Error'): EditorActionTypes => ({
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

const getWorkshopsStart = (): EditorActionTypes => ({
  type: WORKSHOPS.GET.START,
});

/**
 * Successfully got the workshops
 */
export const getWorkshopsSuccess = (workshops: Workshop[]): EditorActionTypes => ({
  type: WORKSHOPS.GET.SUCCESS,
  workshops,
});

/**
 * Failed to get the workshops
 */
export const getWorkshopsFailure = (errorMessage: string): EditorActionTypes => ({
  type: WORKSHOPS.GET.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Get a list of workshops for the current user
 */
export const getWorkshops = (): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(getWorkshopsStart());
};

const createNotebookStart = (name: string, cells: Pick<DCell, 'language' | 'contents'>[] = []): EditorActionTypes => ({
  type: NOTEBOOKS.CREATE.START,
  name,
  cells,
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
export const createNotebookFailure = (errorMessage: string = 'Unknown Error'): EditorActionTypes => ({
  type: NOTEBOOKS.CREATE.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Create a notebook with the given name
 */
export const createNotebook = (
  name: string,
  cells: Pick<DCell, 'language' | 'contents'>[] = []
): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(createNotebookStart(name, cells));
};

const createWorkshopStart = (
  name: string,
  description: string,
  cells: Pick<DCell, 'language' | 'contents'>[] = []
): EditorActionTypes => ({
  type: WORKSHOPS.CREATE.START,
  name,
  description,
  cells,
});

/**
 * Successfully created a workshop
 */
export const createWorkshopSuccess = (workshop: Workshop): EditorActionTypes => ({
  type: WORKSHOPS.CREATE.SUCCESS,
  workshop,
});

/**
 * Failed to create a workshop
 */
export const createWorkshopFailure = (errorMessage: string): EditorActionTypes => ({
  type: WORKSHOPS.CREATE.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Create a workshop with the given name and description
 */
export const createWorkshop = (
  name: string,
  description: string,
  cells: Pick<DCell, 'language' | 'contents'>[] = []
): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(createWorkshopStart(name, description, cells));
};

const openNotebookStart = (nb_id: Notebook['nb_id'], force: boolean): EditorActionTypes => ({
  type: NOTEBOOKS.OPEN.START,
  nb_id,
  force,
});

/**
 * Successfully opened a notebook
 */
export const openNotebookSuccess = (notebook: NotebookContents, activeUids: string[] = []): EditorActionTypes => ({
  type: NOTEBOOKS.OPEN.SUCCESS,
  notebook,
  activeUids,
});

/**
 * Failed to open a notebook
 */
export const openNotebookFailure = (errorMessage: string = 'Unknown Error'): EditorActionTypes => ({
  type: NOTEBOOKS.OPEN.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Open the notebook with the given id
 */
export const openNotebook = (nb_id: Notebook['nb_id'], force: boolean = false): EditorAsyncActionTypes => async (
  dispatch
) => {
  dispatch(openNotebookStart(nb_id, force));
};

/**
 * A user has connected to a notebook
 */
export const connectToNotebook = (nb_id: Notebook['nb_id'], uid: DUser['uid']): EditorActionTypes => ({
  type: NOTEBOOKS.ACCESS.CONNECT,
  nb_id,
  uid,
});

/**
 * A user has disconnected from the notebook
 */
export const disconnectFromNotebook = (
  isMe: boolean,
  nb_id: Notebook['nb_id'],
  uid: DUser['uid']
): EditorActionTypes => ({
  type: NOTEBOOKS.ACCESS.DISCONNECT,
  isMe,
  nb_id,
  uid,
});

const shareNotebookStart = (
  nb_id: Notebook['nb_id'],
  emails: string,
  access_level: NotebookAccessLevelType
): EditorActionTypes => ({
  type: NOTEBOOKS.SHARE.START,
  nb_id,
  emails,
  access_level,
});

/**
 * Successfully shared a notebook
 */
export const shareNotebookSuccess = (
  isMe: boolean,
  nb_id: Notebook['nb_id'],
  users: NotebookAccessLevel[]
): EditorActionTypes => ({
  type: NOTEBOOKS.SHARE.SUCCESS,
  isMe,
  nb_id,
  users,
});

/**
 * Failed to share a notebook
 */
export const shareNotebooksFailure = (errorMessage: string = 'Unknown Error'): EditorActionTypes => ({
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
  emails: string,
  access_level: NotebookAccessLevelType
): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(shareNotebookStart(nb_id, emails, access_level));
};

const shareWorkshopStart = (
  ws_id: Workshop['ws_id'],
  emails: string,
  access_level: WorkshopAccessLevelType
): EditorActionTypes => ({
  type: WORKSHOPS.SHARE.START,
  ws_id,
  emails,
  access_level,
});

/**
 * Successfully shared a workshop
 */
export const shareWorkshopSuccess = (
  isMe: boolean,
  ws_id: string,
  access_levels: Pick<Workshop, 'instructors' | 'attendees'>
): EditorActionTypes => ({
  type: WORKSHOPS.SHARE.SUCCESS,
  isMe,
  ws_id,
  access_levels,
});

/**
 * Failed to share a workshop
 */
export const shareWorkshopFailure = (errorMessage: string): EditorActionTypes => ({
  type: WORKSHOPS.SHARE.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Share a workshop with given users
 */
export const shareWorkshop = (
  ws_id: Workshop['ws_id'],
  emails: string,
  access_level: WorkshopAccessLevelType
): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(shareWorkshopStart(ws_id, emails, access_level));
};

const unshareNotebookStart = (nb_id: Notebook['nb_id'], emails: string): EditorActionTypes => ({
  type: NOTEBOOKS.UNSHARE.START,
  nb_id,
  emails,
});

/**
 * Successfully unshared a notebook
 */
export const unshareNotebookSuccess = (
  isMe: boolean,
  includedMe: boolean,
  nb_id: Notebook['nb_id'],
  uids: NotebookAccessLevel['uid'][]
): EditorActionTypes => ({
  type: NOTEBOOKS.UNSHARE.SUCCESS,
  isMe,
  includedMe,
  nb_id,
  uids,
});

/**
 * Failed to unshare a notebook
 */
export const unshareNotebookFailure = (errorMessage: string): EditorActionTypes => ({
  type: NOTEBOOKS.UNSHARE.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Unshare a notebook with given users
 */
export const unshareNotebook = (nb_id: Notebook['nb_id'], emails: string): EditorAsyncActionTypes => async (
  dispatch
) => {
  dispatch(unshareNotebookStart(nb_id, emails));
};

const releaseWorkshopStart = (ws_id: Workshop['ws_id']): EditorActionTypes => ({
  type: WORKSHOPS.RELEASE.START,
  ws_id,
});

/**
 * Successfully released a workshop to attendees
 */
export const releaseWorkshopSuccess = (isMe: boolean, ws_id: Workshop['ws_id']): EditorActionTypes => ({
  type: WORKSHOPS.RELEASE.SUCCESS,
  isMe,
  ws_id,
});

/**
 * Failed to release a workshop to attendees
 */
export const releaseWorkshopFailure = (errorMessage: string): EditorActionTypes => ({
  type: WORKSHOPS.RELEASE.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Release a workshop to attendees
 */
export const releaseWorkshop = (ws_id: Workshop['ws_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(releaseWorkshopStart(ws_id));
};

/**
 * Select a given user to view outputs for
 */
export const selectOutputUser = (uid: DUser['uid']): EditorActionTypes => ({
  type: NOTEBOOKS.OUTPUTS.SELECT,
  uid,
});

/**
 * Receive an output from the server for a given user
 */
export const receiveOutputs = (output: OOutput): EditorActionTypes => ({
  type: NOTEBOOKS.OUTPUTS.RECEIVE,
  output,
});

const sendMessageStart = (message: string): EditorActionTypes => ({
  type: NOTEBOOKS.SEND_MESSAGE.START,
  message,
});

/**
 * Successfully sent a message
 */
export const sendMessageSuccess = (isMe: boolean, message: OChatMessage): EditorActionTypes => ({
  type: NOTEBOOKS.SEND_MESSAGE.SUCCESS,
  isMe,
  message,
});

/**
 * Failed to send a message
 */
export const sendMessageFailure = (errorMessage: string): EditorActionTypes => ({
  type: NOTEBOOKS.SEND_MESSAGE.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Send a message to collaborators
 */
export const sendMessage = (message: string): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(sendMessageStart(message));
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
  cell: Required<DCell>
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
export const lockCellFailure = (errorMessage: string = 'Unknown Error'): EditorActionTypes => ({
  type: CELL.LOCK.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to lock a given cell
 */
export const lockCell = (cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
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
  cell: Required<DCell>
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
export const unlockCellFailure = (errorMessage: string = 'Unknown Error'): EditorActionTypes => ({
  type: CELL.UNLOCK.FAILURE,
  error: {
    message: errorMessage,
  },
});

/**
 * Try to unlock the given cell
 */
export const unlockCell = (cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
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
  cell: Required<DCell>
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
export const addCellFailure = (errorMessage: string = 'Unknown Error'): EditorActionTypes => ({
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
export const deleteCellSuccess = (
  isMe: boolean,
  nb_id: Notebook['nb_id'],
  cell_id: EditorCell['cell_id']
): EditorActionTypes => ({
  type: CELL.DELETE.SUCCESS,
  isMe,
  nb_id,
  cell_id,
});

/**
 * Failed to delete a cell
 */
export const deleteCellFailure = (errorMessage: string = 'Unknown Error'): EditorActionTypes => ({
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
export const editCellFailure = (errorMessage: string = 'Unknown Error'): EditorActionTypes => {
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
export const selectCell = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
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
export const addCellToQueue = (cell_id: EditorCell['cell_id']): EditorAsyncActionTypes => async (dispatch) => {
  dispatch(
    appendKernelLog({
      status: 'Info',
      message: `Queued cell ${cell_id}`,
    })
  );

  dispatch(executeCodeQueue(cell_id));
};

/**
 * Remove a cell from the execution queue
 */
export const removeCellFromQueue = (cell_id: EditorCell['cell_id']): EditorActionTypes => ({
  type: KERNEL.EXECUTE.UNQUEUE,
  cell_id,
});

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
  errorMessage: string = 'Unknown Error'
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
export const receiveKernelMessage = (
  cell_id: EditorCell['cell_id'],
  runIndex: number,
  messages: KernelOutput[]
): EditorActionTypes => ({
  type: KERNEL.MESSAGE.RECEIVE,
  cell_id,
  runIndex,
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
    dispatch(removeCellFromQueue(cell.cell_id));
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
