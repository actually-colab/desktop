import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import { CELL, EditorActionTypes, KERNEL, NOTEBOOKS } from '../types/redux/editor';
import {
  EditorCell,
  ImmutableEditorCell,
  ImmutableKernelOutput,
  ImmutableLock,
  ImmutableNotebook,
  ImmutableReducedNotebook,
} from '../types/notebook';
import { ImmutableKernelLog, Kernel } from '../types/kernel';
import { BASE_CELL, IMMUTABLE_BASE_CELL } from '../constants/notebook';
import { DEFAULT_GATEWAY_URI } from '../constants/jupyter';
import {
  cellArrayToImmutableMap,
  cleanDCell,
  reduceImmutableNotebook,
  reduceNotebookContents,
} from '../utils/notebook';
import { makeImmutableKernelLog } from '../utils/immutable/kernel';
import {
  makeImmutableEditorCell,
  makeImmutableKernelOutput,
  makeImmutableLock,
  makeImmutableNotebook,
  makeImmutableReducedNotebook,
} from '../utils/immutable/notebook';

/**
 * The editor redux state
 */
export interface EditorState {
  /**
   * If the application should continuously try to connect to the kernel
   */
  autoConnectToKernel: boolean;
  /**
   * If the user is currently editing the gateway URI. Should disable connecting to the kernel when this is happening
   */
  isEditingGatewayUri: boolean;

  /**
   * If the editor is currently connecting to a kernel
   */
  isConnectingToKernel: boolean;
  /**
   * If the editor is trying to reconnect to a kernel
   */
  isReconnectingToKernel: boolean;
  /**
   * An error message if the kernel connection fails
   */
  connectToKernelErrorMessage: string;

  /**
   * If the editor is currently fetching the latest notebooks
   */
  isGettingNotebooks: boolean;
  /**
   * Error message if fetching the notebooks fails
   */
  getNotebooksErrorMessage: string;
  /**
   * The timestamp of the last time the notebooks were fetched
   */
  getNotebooksTimestamp: Date | null;
  /**
   * If the editor is creating a notebook
   */
  isCreatingNotebook: boolean;
  /**
   * If the editor is opening a notebook
   */
  isOpeningNotebook: boolean;
  /**
   * The `nb_id` of the notebook being opened
   */
  openingNotebookId: string;

  /**
   * If the editor is currently adding a cell
   */
  isAddingCell: boolean;
  /**
   * If the editor is currently deleting a cell
   */
  isDeletingCell: boolean;
  /**
   * If the editor is currently editing a cell
   */
  isEditingCell: boolean;
  /**
   * If the editor is currently executing a cell
   */
  isExecutingCode: boolean;

  /**
   * The `cell_id` of the cell being locked
   */
  lockingCellId: EditorCell['cell_id'];
  /**
   * The `cell_id` of the cell being unlocked
   */
  unlockingCellId: EditorCell['cell_id'];
  /**
   * A list of locked cells and user ID's
   */
  lockedCells: ImmutableList<ImmutableLock>;

  /**
   * The `cell_id` of the currently selected cell
   */
  selectedCellId: EditorCell['cell_id'];
  /**
   * The latest execution count from the kernel
   */
  executionCount: number;
  /**
   * The `cell_id` of the currently running code
   */
  runningCellId: EditorCell['cell_id'];
  /**
   * A queue of `cell_id`'s to run on the kernel
   */
  runQueue: ImmutableList<EditorCell['cell_id']>;

  /**
   * The URI of the kernel gateway
   */
  gatewayUri: string;
  /**
   * The basic information of the connected kernel or null if there is none
   */
  kernel: Kernel | null;

  /**
   * A list of notebooks the user has access to without their contents
   */
  notebooks: ImmutableList<ImmutableNotebook>;
  /**
   * The currently open notebook with ordered `cell_id`'s
   */
  notebook: ImmutableReducedNotebook | null;
  /**
   * A map of `cell_id`'s to cells in the currently open notebook
   */
  cells: ImmutableMap<EditorCell['cell_id'], ImmutableEditorCell>;
  /**
   * A map of `cell_id`'s to outputs for each cell
   */
  outputs: ImmutableMap<EditorCell['cell_id'], ImmutableList<ImmutableKernelOutput>>;
  /**
   * A list of logs from various kernel interactions
   */
  logs: ImmutableList<ImmutableKernelLog>;
}

const initialState: EditorState = {
  autoConnectToKernel: process.env.REACT_APP_KERNEL_AUTO_CONNECT !== 'off',
  isEditingGatewayUri: false,

  isConnectingToKernel: false,
  isReconnectingToKernel: false,
  connectToKernelErrorMessage: '',

  isGettingNotebooks: false,
  getNotebooksErrorMessage: '',
  getNotebooksTimestamp: null,
  isCreatingNotebook: false,
  isOpeningNotebook: false,
  openingNotebookId: '',

  isAddingCell: false,
  isDeletingCell: false,
  isEditingCell: false,
  isExecutingCode: false,

  lockingCellId: '',
  unlockingCellId: '',
  lockedCells: ImmutableList(),

  selectedCellId: '',
  executionCount: 0,
  runningCellId: '',
  runQueue: ImmutableList(),

  gatewayUri: DEFAULT_GATEWAY_URI,
  kernel: null,

  notebooks: ImmutableList(),
  notebook: null,
  cells: ImmutableMap(),
  outputs: ImmutableMap(),
  logs: ImmutableList(),
};

/**
 * The editor reducer
 */
const reducer = (state = initialState, action: EditorActionTypes): EditorState => {
  switch (action.type) {
    /**
     * Append a log item to the kernel logs
     */
    case KERNEL.LOG.APPEND:
      return {
        ...state,
        logs: state.logs.push(
          makeImmutableKernelLog({
            ...action.log,
            id: state.logs.size,
          })
        ),
      };
    /**
     * Clear the kernel logs
     */
    case KERNEL.LOG.CLEAR:
      return {
        ...state,
        logs: state.logs.clear(),
      };

    /**
     * Set the kernel gateway to a new value
     */
    case KERNEL.GATEWAY.SET:
      return {
        ...state,
        gatewayUri: action.uri,
      };
    /**
     * Start editing the kernel gateway
     */
    case KERNEL.GATEWAY.EDIT:
      return {
        ...state,
        isEditingGatewayUri: action.editing,
      };

    /**
     * Toggle auto connecting to the kernel
     */
    case KERNEL.CONNECT.AUTO:
      return {
        ...state,
        autoConnectToKernel: action.enable,
      };

    /**
     * Started connecting to the kernel
     */
    case KERNEL.CONNECT.START:
      return {
        ...state,
        executionCount: 0,
        runningCellId: '',
        isConnectingToKernel: true,
        connectToKernelErrorMessage: '',
        kernel: null,
      };
    /**
     * Connected to the kernel successfully
     */
    case KERNEL.CONNECT.SUCCESS:
      return {
        ...state,
        isConnectingToKernel: false,
        kernel: action.kernel,
      };
    /**
     * Failed to connect to the kernel
     */
    case KERNEL.CONNECT.FAILURE:
      return {
        ...state,
        isConnectingToKernel: false,
        connectToKernelErrorMessage: action.error.message,
      };

    /**
     * Started reconnecting to the kernel
     */
    case KERNEL.CONNECT.RECONNECTING:
      return {
        ...state,
        isReconnectingToKernel: true,
      };
    /**
     * Successfully reconnected to the kernel
     */
    case KERNEL.CONNECT.RECONNECTED:
      return {
        ...state,
        isReconnectingToKernel: false,
      };
    /**
     * Started disconnecting from the kernel
     */
    case KERNEL.DISCONNECT.START:
      return {
        ...state,
        autoConnectToKernel: action.retry,
      };
    /**
     * Disconnected from the kernel successfully
     */
    case KERNEL.DISCONNECT.SUCCESS:
      return {
        ...state,
        isConnectingToKernel: false,
        isReconnectingToKernel: false,
        isExecutingCode: false,
        executionCount: 0,
        runningCellId: '',
        runQueue: state.runQueue.clear(),
        kernel: null,
      };
    /**
     * Restarted the kernel successfully
     */
    case KERNEL.RESTART.SUCCESS:
      return {
        ...state,
        isExecutingCode: false,
        executionCount: 0,
        runningCellId: '',
        runQueue: state.runQueue.clear(),
        cells: state.cells.map((cell) => cell.set('runIndex', BASE_CELL.runIndex)),
        outputs: state.outputs.clear(),
      };

    /**
     * Started fetching the user's notebooks
     */
    case NOTEBOOKS.GET.START:
      return {
        ...state,
        isGettingNotebooks: true,
        getNotebooksErrorMessage: '',
      };
    /**
     * Fetched the users notebooks successfully
     */
    case NOTEBOOKS.GET.SUCCESS:
      return {
        ...state,
        isGettingNotebooks: false,
        notebooks: ImmutableList(action.notebooks.map((notebook) => makeImmutableNotebook(notebook))),
        getNotebooksTimestamp: new Date(),
      };
    /**
     * Failed to get the users notebooks
     */
    case NOTEBOOKS.GET.FAILURE:
      return {
        ...state,
        isGettingNotebooks: false,
        getNotebooksErrorMessage: action.error.message,
      };

    /**
     * Started creating a notebook
     */
    case NOTEBOOKS.CREATE.START:
      return {
        ...state,
        isCreatingNotebook: true,
      };
    /**
     * Created a new notebook successfully
     */
    case NOTEBOOKS.CREATE.SUCCESS:
      return {
        ...state,
        isCreatingNotebook: false,
        notebooks: state.notebooks.push(makeImmutableNotebook(action.notebook)),
      };
    /**
     * Failed to create a new notebook
     */
    case NOTEBOOKS.CREATE.FAILURE:
      return {
        ...state,
        isCreatingNotebook: false,
      };

    /**
     * Started opening a given notebook
     */
    case NOTEBOOKS.OPEN.START:
      return {
        ...state,
        isOpeningNotebook: true,
        openingNotebookId: action.nb_id,
        notebook: reduceImmutableNotebook(
          state.notebooks.find((notebook) => notebook.get('nb_id') === action.nb_id) ?? null
        ),
      };
    /**
     * Successfully opened a notebook
     */
    case NOTEBOOKS.OPEN.SUCCESS: {
      const dcells = Object.values(action.notebook.cells);

      return {
        ...state,
        isOpeningNotebook: false,
        openingNotebookId: '',
        lockingCellId: '',
        unlockingCellId: '',
        lockedCells: ImmutableList(
          dcells
            .filter((dcell) => (dcell.lock_held_by ?? '') !== '')
            .map((dcell) =>
              makeImmutableLock({
                cell_id: dcell.cell_id,
                uid: dcell.lock_held_by ?? '',
              })
            )
        ),
        notebook: makeImmutableReducedNotebook(reduceNotebookContents(action.notebook)),
        cells: cellArrayToImmutableMap(dcells.map((dcell) => cleanDCell(dcell))),
      };
    }
    /**
     * Failed to open a notebook
     */
    case NOTEBOOKS.OPEN.FAILURE:
      return {
        ...state,
        isOpeningNotebook: false,
        openingNotebookId: '',
      };

    /**
     * Started locking a given cell
     */
    case CELL.LOCK.START:
      return {
        ...state,
        lockingCellId: action.cell_id,
      };
    /**
     * Successfully locked a cell
     */
    case CELL.LOCK.SUCCESS:
      return {
        ...state,
        lockingCellId: action.isMe ? '' : state.lockingCellId,
        lockedCells: state.lockedCells
          .filter((lock) => lock.get('cell_id') !== action.cell_id)
          .push(
            makeImmutableLock({
              uid: action.uid,
              cell_id: action.cell_id,
            })
          ),
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (cell) =>
          cell.merge(makeImmutableEditorCell(action.cell as EditorCell))
        ),
      };
    /**
     * Failed to lock a cell, for instance another user has the lock or there was some error
     */
    case CELL.LOCK.FAILURE:
      return {
        ...state,
        lockingCellId: '',
      };

    /**
     * Started to unlock a cell
     */
    case CELL.UNLOCK.START:
      return {
        ...state,
        unlockingCellId: '',
      };
    /**
     * Successfully unlocked the cell
     */
    case CELL.UNLOCK.SUCCESS:
      return {
        ...state,
        unlockingCellId: action.isMe ? '' : state.unlockingCellId,
        lockedCells: state.lockedCells.filter(
          (lock) => lock.get('cell_id') !== action.cell_id || lock.get('uid') !== action.uid
        ),
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (cell) =>
          cell.merge(makeImmutableEditorCell(action.cell as EditorCell))
        ),
      };
    /**
     * Failed to unlock the cell
     */
    case CELL.UNLOCK.FAILURE:
      return {
        ...state,
        unlockingCellId: '',
      };

    /**
     * Started adding a new cell
     */
    case CELL.ADD.START:
      return {
        ...state,
        isAddingCell: true,
      };
    /**
     * A user successfully added a new cell
     */
    case CELL.ADD.SUCCESS: {
      if (state.notebook === null) {
        console.error('Notebook was null');
        return state;
      }

      const notebook = state.notebook;

      return {
        ...state,
        isAddingCell: action.isMe ? false : state.isAddingCell,
        notebook: state.notebook.update('cell_ids', ImmutableList(), (cell_ids) =>
          cell_ids.splice(action.index === -1 ? notebook.get('cell_ids').size ?? 0 : action.index, 0, action.cell_id)
        ),
        cells: state.cells.set(action.cell_id, makeImmutableEditorCell({ ...BASE_CELL, ...action.cell })),
      };
    }
    /**
     * Failed to add a new cell
     */
    case CELL.ADD.FAILURE:
      return {
        ...state,
        isAddingCell: false,
      };

    /**
     * Started deleting a cell
     */
    case CELL.DELETE.START:
      return {
        ...state,
        isDeletingCell: true,
      };
    /**
     * A user successfully deleted a cell
     */
    case CELL.DELETE.SUCCESS: {
      if (state.notebook === null) {
        console.error('Notebook was null');
        return state;
      }

      const selectionChanges: Partial<EditorState> = {};

      // If the selected cell is deleted, the selected cell should become the next cell or remain the last
      if (state.selectedCellId === action.cell_id) {
        const currentIndex = state.notebook.get('cell_ids').findIndex((cell_id) => cell_id === state.selectedCellId);
        const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

        if (nextIndex <= state.notebook.get('cell_ids').size - 1) {
          selectionChanges.selectedCellId = state.notebook.get('cell_ids').get(nextIndex);
        } else if (state.notebook.get('cell_ids').size > 1) {
          selectionChanges.selectedCellId = state.notebook.get('cell_ids').get(state.notebook.get('cell_ids').size - 2);
        } else {
          selectionChanges.selectedCellId = '';
        }
      }

      return {
        ...state,
        ...selectionChanges,
        isDeletingCell: action.isMe ? false : state.isDeletingCell,
        lockedCells: state.lockedCells.filter((lock) => lock.get('cell_id') !== action.cell_id),
        cells: state.cells.delete(action.cell_id),
        outputs: state.outputs.remove(action.cell_id),
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id),
      };
    }
    /**
     * Failed to delete a cell
     */
    case CELL.DELETE.FAILURE:
      return {
        ...state,
        isDeletingCell: false,
      };

    /**
     * Started editing a cell.
     *
     * Store the changes since the edit request is debounced so success will be delayed
     */
    case CELL.EDIT.START:
      const runQueueChanges: Partial<EditorState> = {};

      // If a cell in the runQueue is no longer python, it should not be executed
      if (action.changes.language === 'markdown') {
        if (state.runQueue.includes(action.cell_id)) {
          runQueueChanges.runQueue = state.runQueue.filter((cell_id) => cell_id !== action.cell_id);
        }
      }

      return {
        ...state,
        ...runQueueChanges,
        isEditingCell: true,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.merge(
            makeImmutableEditorCell({
              ...action.changes,
              time_modified: Date.now(),
            } as EditorCell)
          )
        ),
      };

    /**
     * A user successfully edited a cell.
     *
     * The changes may be older due to debouncing, only apply if they are newer
     */
    case CELL.EDIT.SUCCESS: {
      const oldDate = state.cells.get(action.cell_id)?.get('time_modified') ?? -1;
      const newDate = action.cell.time_modified;
      const changesAreNewer = newDate > oldDate;

      const runQueueChanges: Partial<EditorState> = {};

      // If a cell in the runQueue is no longer python, it should not be executed
      if (changesAreNewer && action.cell.language === 'markdown') {
        if (state.runQueue.includes(action.cell_id)) {
          runQueueChanges.runQueue = state.runQueue.filter((cell_id) => cell_id !== action.cell_id);
        }
      }

      return {
        ...state,
        ...runQueueChanges,
        isEditingCell: action.isMe ? false : state.isEditingCell,
        cells: changesAreNewer
          ? state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
              value.merge(makeImmutableEditorCell(action.cell as EditorCell))
            )
          : state.cells,
      };
    }
    /**
     * Failed to edit a cell
     */
    case CELL.EDIT.FAILURE:
      return {
        ...state,
        isEditingCell: false,
      };
    /**
     * Updated just the contents of a cell
     */
    case CELL.EDIT.UPDATE_CODE:
      return {
        ...state,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) => value.set('contents', action.code)),
      };

    /**
     * Selected a cell
     */
    case CELL.SELECT.SET:
      return {
        ...state,
        selectedCellId: action.cell_id,
      };
    /**
     * Advanced the selection to the next cell
     */
    case CELL.SELECT.NEXT: {
      if (state.notebook === null) {
        console.error('Notebook was null');
        return state;
      }

      const cellCount = state.notebook.get('cell_ids').size;

      if (cellCount === 0) {
        // No cells to select
        return state;
      }

      const currentIndex =
        state.selectedCellId === ''
          ? -1
          : state.notebook.get('cell_ids').findIndex((cell_id) => cell_id === state.selectedCellId);
      let nextIndex = state.selectedCellId === '' ? 1 : currentIndex === -1 ? 0 : currentIndex + 1;

      // Handle the case of if the cell is already the last cell
      if (nextIndex >= state.notebook.get('cell_ids').size) {
        nextIndex = state.notebook.get('cell_ids').size - 1;
      }

      return {
        ...state,
        selectedCellId: state.notebook.get('cell_ids').get(nextIndex) ?? '',
      };
    }

    /**
     * Add a cell to the execution queue
     */
    case KERNEL.EXECUTE.QUEUE:
      return {
        ...state,
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id).push(action.cell_id),
      };
    /**
     * Started executing a given cell against the kernel
     */
    case KERNEL.EXECUTE.START:
      return {
        ...state,
        kernel:
          state.kernel !== null
            ? {
                ...state.kernel,
                status: 'Busy',
              }
            : null,
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell.get('cell_id')),
        isExecutingCode: true,
        runningCellId: action.cell.get('cell_id'),
        outputs: state.outputs.update(action.cell.get('cell_id'), ImmutableList(), (outputs) => outputs.clear()),
      };
    /**
     * Successfully executed a cell against the kernel
     */
    case KERNEL.EXECUTE.SUCCESS:
      return {
        ...state,
        kernel:
          state.kernel !== null
            ? {
                ...state.kernel,
                status: 'Idle',
              }
            : null,
        isExecutingCode: false,
        runningCellId: '',
        executionCount: action.runIndex,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.get('runIndex'))
        ),
      };
    /**
     * Failed to execute a cell or received an error from the kernel
     */
    case KERNEL.EXECUTE.FAILURE:
      return {
        ...state,
        kernel:
          state.kernel !== null
            ? {
                ...state.kernel,
                status: 'Idle',
              }
            : null,
        isExecutingCode: false,
        runningCellId: '',
        executionCount: action.runIndex,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.get('runIndex'))
        ),
        runQueue: state.runQueue.clear(),
      };

    /**
     * Received a message from the kernel `iopub` channel
     */
    case KERNEL.MESSAGE.RECEIVE:
      return {
        ...state,
        outputs: state.outputs.update(action.cell_id, ImmutableList(), (outputs) =>
          outputs.concat(
            ImmutableList<ImmutableKernelOutput>(
              action.messages.map<ImmutableKernelOutput>((message) => makeImmutableKernelOutput(message))
            )
          )
        ),
      };
    /**
     * Update the run index of a given cell as soon as a message includes it
     */
    case KERNEL.MESSAGE.UPDATE_RUN_INDEX:
      return {
        ...state,
        cells: state.cells.update(action.cell_id, IMMUTABLE_BASE_CELL, (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.get('runIndex'))
        ),
      };
    default:
      return state;
  }
};

export default reducer;
