import { List as ImmutableList, Map as ImmutableMap, OrderedSet as ImmutableOrderedSet } from 'immutable';
import { DUser } from '@actually-colab/editor-types';

import { CELL, CLIENT, CONTACTS, KERNEL, NOTEBOOKS, WORKSHOPS } from '../types/redux/editor';
import { SIGN_OUT } from '../types/redux/auth';
import { ClientConnectionStatus } from '../types/client';
import { EditorCell } from '../types/notebook';
import { Kernel } from '../types/kernel';
import { DEFAULT_GATEWAY_URI } from '../constants/jupyter';
import {
  ImmutableEditorCell,
  ImmutableEditorCellFactory,
  ImmutableKernelLog,
  ImmutableKernelLogFactory,
  ImmutableKernelOutput,
  ImmutableKernelOutputFactory,
  ImmutableLock,
  ImmutableLockFactory,
  ImmutableNotebook,
  ImmutableNotebookFactory,
  ImmutableOutputMetadata,
  ImmutableOutputMetadataFactory,
  ImmutableReducedNotebook,
  ImmutableReducedNotebookFactory,
  ImmutableUser,
  ImmutableUserFactory,
  ImmutableWorkshop,
  ImmutableWorkshopFactory,
} from '../immutable';
import {
  cellArrayToImmutableMap,
  cleanDCell,
  convertOutputToReceivablePayload,
  makeNotebookAccessLevelsImmutable,
  makeWorkshopAccessLevelsImmutable,
  reduceImmutableNotebook,
  reduceNotebookContents,
} from '../utils/notebook';
import { ReduxActions } from './actions';

/**
 * The editor redux state
 */
export interface EditorState {
  /**
   * The status of the socket client connection
   */
  clientConnectionStatus: ClientConnectionStatus;

  /**
   * The contacts that the user has shared notebooks with
   */
  contacts: DUser['email'][];

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
   * If the editor is sharing a notebook
   */
  isSharingNotebook: boolean;

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
   * A list of workshops the user has access to without their contents
   */
  workshops: ImmutableList<ImmutableWorkshop>;

  /**
   * The currently open notebook with ordered `cell_id`'s
   */
  notebook: ImmutableReducedNotebook | null;
  /**
   * A map of `cell_id`'s to cells in the currently open notebook
   */
  cells: ImmutableMap<EditorCell['cell_id'], ImmutableEditorCell>;

  /**
   * The `uid` to view outputs for
   */
  selectedOutputsUid: string;
  /**
   * A map of `cell_id`'s to a map of `uid` to a list of outputs for each cell.
   *
   * Use an empty string as the key for the current user
   */
  outputs: ImmutableMap<EditorCell['cell_id'], ImmutableMap<DUser['uid'], ImmutableList<ImmutableKernelOutput>>>;
  /**
   * A map of `cell_id`'s to a map of `uid` to the output metadata
   */
  outputsMetadata: ImmutableMap<EditorCell['cell_id'], ImmutableMap<DUser['uid'], ImmutableOutputMetadata>>;

  /**
   * A list of users who are active
   */
  users: ImmutableOrderedSet<ImmutableUser>;
  /**
   * A list of logs from various kernel interactions
   */
  logs: ImmutableList<ImmutableKernelLog>;
}

const initialState: EditorState = {
  clientConnectionStatus: 'Offline',

  contacts: [],

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
  isSharingNotebook: false,

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
  workshops: ImmutableList(),

  notebook: null,
  cells: ImmutableMap(),

  selectedOutputsUid: '',
  outputs: ImmutableMap(),
  outputsMetadata: ImmutableMap(),

  users: ImmutableOrderedSet(),
  logs: ImmutableList(),
};

/**
 * The editor reducer
 */
const reducer = (state = initialState, action: ReduxActions): EditorState => {
  switch (action.type) {
    /**
     * From Auth, if sign out occurs reset the state
     */
    case SIGN_OUT.SUCCESS:
      return {
        ...initialState,
      };

    /**
     * Started connecting to the client socket
     */
    case CLIENT.CONNECT.START:
      return {
        ...state,
        clientConnectionStatus: 'Connecting',
      };
    /**
     * Successfully connected to the client socket
     */
    case CLIENT.CONNECT.SUCCESS:
      return {
        ...state,
        clientConnectionStatus: 'Connected',
      };
    /**
     * Failed to connect to the client socket
     */
    case CLIENT.CONNECT.FAILURE:
      return {
        ...state,
        clientConnectionStatus: 'Offline',
      };

    /**
     * Loaded contacts from local storage
     */
    case CONTACTS.GET.SUCCESS:
      return {
        ...state,
        contacts: action.contacts,
      };
    /**
     * Saved contacts to local storage
     */
    case CONTACTS.SET.SUCCESS:
      return {
        ...state,
        contacts: action.contacts,
      };

    /**
     * Append a log item to the kernel logs
     */
    case KERNEL.LOG.APPEND:
      return {
        ...state,
        logs: state.logs.push(
          new ImmutableKernelLogFactory({
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
        cells: state.cells.map((cell) => cell.set('runIndex', -1)),
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
        notebooks: ImmutableList(
          action.notebooks.map(
            (notebook) =>
              new ImmutableNotebookFactory({
                ...notebook,
                users: makeNotebookAccessLevelsImmutable(notebook.users),
              })
          )
        ),
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
        notebooks: state.notebooks.push(
          new ImmutableNotebookFactory({
            ...action.notebook,
            users: makeNotebookAccessLevelsImmutable(action.notebook.users),
          })
        ),
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
     * Started creating a workshop
     */
    case WORKSHOPS.CREATE.START:
      return {
        ...state,
        isCreatingNotebook: true,
      };
    /**
     * Created a new workshop successfully
     */
    case WORKSHOPS.CREATE.SUCCESS:
      return {
        ...state,
        isCreatingNotebook: false,
        workshops: state.workshops.push(
          new ImmutableWorkshopFactory({
            ...action.workshop,
            instructors: makeWorkshopAccessLevelsImmutable(action.workshop.instructors),
            attendees: makeWorkshopAccessLevelsImmutable(action.workshop.attendees),
            main_notebook: new ImmutableNotebookFactory({
              ...action.workshop.main_notebook,
              users: makeNotebookAccessLevelsImmutable(action.workshop.main_notebook.users),
            }),
          })
        ),
      };
    /**
     * Failed to create a new workshop
     */
    case WORKSHOPS.CREATE.FAILURE:
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
        notebook: reduceImmutableNotebook(state.notebooks.find((notebook) => notebook.nb_id === action.nb_id) ?? null),
      };
    /**
     * Successfully opened a notebook
     */
    case NOTEBOOKS.OPEN.SUCCESS: {
      const dcells = Object.values(action.notebook.cells);
      const reducedNotebook = reduceNotebookContents(action.notebook);
      const immutableReducedNotebook = new ImmutableReducedNotebookFactory({
        ...reducedNotebook,
        users: makeNotebookAccessLevelsImmutable(reducedNotebook.users),
        cell_ids: ImmutableList(reducedNotebook.cell_ids),
      });

      return {
        ...state,
        isOpeningNotebook: false,
        openingNotebookId: '',
        lockingCellId: '',
        unlockingCellId: '',
        selectedCellId: '',
        selectedOutputsUid: '',
        lockedCells: ImmutableList(
          dcells
            .filter((dcell) => (dcell.lock_held_by ?? '') !== '')
            .map(
              (dcell) =>
                new ImmutableLockFactory({
                  cell_id: dcell.cell_id,
                  uid: dcell.lock_held_by ?? '',
                })
            )
        ),
        notebook: immutableReducedNotebook,
        cells: cellArrayToImmutableMap(dcells.map((dcell) => cleanDCell(dcell))),
        users: state.users.clear().concat(
          action.activeUids
            .map<ImmutableUser | undefined>((uid) => {
              const accessLevel = reducedNotebook.users.find((_user) => _user.uid === uid);

              if (!accessLevel) {
                return undefined;
              }

              const { access_level, ...user } = accessLevel;

              return new ImmutableUserFactory(user);
            })
            .filter<ImmutableUser>((user): user is ImmutableUser => !!user)
        ),
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
     * A user has opened the notebook
     */
    case NOTEBOOKS.ACCESS.CONNECT:
      return {
        ...state,
        users: state.users.filter((user) => user.uid !== action.user.uid).add(new ImmutableUserFactory(action.user)),
      };
    /**
     * A user has closed the notebook
     */
    case NOTEBOOKS.ACCESS.DISCONNECT:
      return {
        ...state,
        users: state.users.filter((user) => user.uid !== action.uid),
      };

    /**
     * Started sharing a notebook
     */
    case NOTEBOOKS.SHARE.START:
      return {
        ...state,
        isSharingNotebook: true,
      };
    /**
     * Successfully shared a notebook
     */
    case NOTEBOOKS.SHARE.SUCCESS: {
      return {
        ...state,
        isSharingNotebook: false,
        notebooks: state.notebooks
          .filter((notebook) => notebook.nb_id !== action.notebook.nb_id)
          .push(
            new ImmutableNotebookFactory({
              ...action.notebook,
              users: makeNotebookAccessLevelsImmutable(action.notebook.users),
            })
          ),
        notebook:
          state.notebook?.merge({
            time_modified: action.notebook.time_modified,
            users: makeNotebookAccessLevelsImmutable(action.notebook.users),
          }) ?? null,
      };
    }
    /**
     * Failed to share a notebook
     */
    case NOTEBOOKS.SHARE.FAILURE:
      return {
        ...state,
        isSharingNotebook: false,
      };

    /**
     * Selected a given user to view outputs for
     */
    case NOTEBOOKS.OUTPUTS.SELECT:
      return {
        ...state,
        selectedOutputsUid: action.uid,
      };

    /**
     * Received an output object from a user
     */
    case NOTEBOOKS.OUTPUTS.RECEIVE: {
      const { metadata, messages } = convertOutputToReceivablePayload(action.output);

      return {
        ...state,
        outputs: state.outputs.update(action.output.cell_id, ImmutableMap(), (userMap) =>
          userMap.set(
            action.output.uid,
            ImmutableList(messages.map((message) => new ImmutableKernelOutputFactory(message)))
          )
        ),
        outputsMetadata: state.outputsMetadata.update(action.output.cell_id, ImmutableMap(), (userMap) =>
          userMap.set(
            action.output.uid,
            new ImmutableOutputMetadataFactory({
              runIndex: metadata.runIndex,
              running: false,
            })
          )
        ),
      };
    }

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
          .filter((lock) => lock.cell_id !== action.cell_id)
          .push(
            new ImmutableLockFactory({
              uid: action.uid,
              cell_id: action.cell_id,
            })
          ),
        cells: state.cells.update(action.cell_id, new ImmutableEditorCellFactory(), (cell) => cell.merge(action.cell)),
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
        lockedCells: state.lockedCells.filter((lock) => lock.cell_id !== action.cell_id || lock.uid !== action.uid),
        cells: state.cells.update(action.cell_id, new ImmutableEditorCellFactory(), (cell) => cell.merge(action.cell)),
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
        notebook: state.notebook.update('cell_ids', (cell_ids) =>
          cell_ids.splice(action.index === -1 ? notebook.cell_ids.size ?? 0 : action.index, 0, action.cell_id)
        ),
        cells: state.cells.set(action.cell_id, new ImmutableEditorCellFactory(action.cell)),
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
        const currentIndex = state.notebook.cell_ids.findIndex((cell_id) => cell_id === state.selectedCellId);
        const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

        if (nextIndex <= state.notebook.cell_ids.size - 1) {
          selectionChanges.selectedCellId = state.notebook.cell_ids.get(nextIndex);
        } else if (state.notebook.cell_ids.size > 1) {
          selectionChanges.selectedCellId = state.notebook.cell_ids.get(state.notebook.cell_ids.size - 2);
        } else {
          selectionChanges.selectedCellId = '';
        }
      }

      return {
        ...state,
        ...selectionChanges,
        isDeletingCell: action.isMe ? false : state.isDeletingCell,
        lockedCells: state.lockedCells.filter((lock) => lock.cell_id !== action.cell_id),
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
      if (action.changes?.language === 'markdown') {
        if (state.runQueue.includes(action.cell_id)) {
          runQueueChanges.runQueue = state.runQueue.filter((cell_id) => cell_id !== action.cell_id);
        }
      }

      return {
        ...state,
        ...runQueueChanges,
        isEditingCell: true,
        cells: state.cells.update(action.cell_id, new ImmutableEditorCellFactory(), (value) =>
          value.merge({
            ...action.changes,
            ...action.metaChanges,
          })
        ),
      };

    /**
     * A user successfully edited a cell.
     *
     * The changes may be older due to debouncing, only apply if they are newer
     */
    case CELL.EDIT.SUCCESS: {
      if (action.isMe) {
        // Ignore success if you created the edit
        return {
          ...state,
          isEditingCell: false,
        };
      }

      const oldDate = state.cells.get(action.cell_id)?.time_modified ?? -1;
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
        cells: changesAreNewer
          ? state.cells.update(action.cell_id, new ImmutableEditorCellFactory(), (value) => value.merge(action.cell))
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
        cells: state.cells.update(action.cell_id, new ImmutableEditorCellFactory(), (value) =>
          value.set('contents', action.code)
        ),
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

      const cellCount = state.notebook.cell_ids.size;

      if (cellCount === 0) {
        // No cells to select
        return state;
      }

      const currentIndex =
        state.selectedCellId === ''
          ? -1
          : state.notebook.cell_ids.findIndex((cell_id) => cell_id === state.selectedCellId);
      let nextIndex = state.selectedCellId === '' ? 1 : currentIndex === -1 ? 0 : currentIndex + 1;

      // Handle the case of if the cell is already the last cell
      if (nextIndex >= state.notebook.cell_ids.size) {
        nextIndex = state.notebook.cell_ids.size - 1;
      }

      return {
        ...state,
        selectedCellId: state.notebook.cell_ids.get(nextIndex) ?? '',
      };
    }

    /**
     * Add a cell to the execution queue
     */
    case KERNEL.EXECUTE.QUEUE: {
      // Do not add the currently running cell to the queue
      if (state.runningCellId === action.cell_id) {
        return state;
      }

      return {
        ...state,
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell_id).push(action.cell_id),
      };
    }
    /**
     * Started executing a given cell against the kernel
     */
    case KERNEL.EXECUTE.START: {
      if (state.runningCellId !== '') {
        console.error('Attempted to run a cell when one is already running!');
        return state;
      }

      return {
        ...state,
        kernel:
          state.kernel !== null
            ? {
                ...state.kernel,
                status: 'Busy',
              }
            : null,
        runQueue: state.runQueue.filter((cell_id) => cell_id !== action.cell.cell_id),
        isExecutingCode: true,
        runningCellId: action.cell.cell_id,
        outputs: state.outputs.update(action.cell.cell_id, ImmutableMap(), (userMap) =>
          userMap.update('', ImmutableList(), (outputs) => outputs.clear())
        ),
      };
    }
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
        cells: state.cells.update(action.cell_id, new ImmutableEditorCellFactory(), (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.runIndex)
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
        cells: state.cells.update(action.cell_id, new ImmutableEditorCellFactory(), (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.runIndex)
        ),
        runQueue: state.runQueue.clear(),
      };

    /**
     * Received a message from the kernel `iopub` channel
     */
    case KERNEL.MESSAGE.RECEIVE:
      return {
        ...state,
        outputs: state.outputs.update(action.cell_id, ImmutableMap(), (userMap) =>
          userMap.update('', ImmutableList(), (outputs) =>
            outputs.concat(
              ImmutableList<ImmutableKernelOutput>(
                action.messages.map<ImmutableKernelOutput>((message) => new ImmutableKernelOutputFactory(message))
              )
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
        cells: state.cells.update(action.cell_id, new ImmutableEditorCellFactory(), (value) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.runIndex)
        ),
      };
    default:
      return state;
  }
};

export default reducer;
