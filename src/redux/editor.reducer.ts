import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import { DUser, Notebook, Workshop } from '@actually-colab/editor-types';

import { CELL, CLIENT, CONTACTS, KERNEL, NOTEBOOKS, WORKSHOPS } from '../types/redux/editor';
import { SIGN_OUT } from '../types/redux/auth';
import { ImmutableMapOf } from '../types/immutable';
import { ClientConnectionStatus } from '../types/client';
import { EditorCell } from '../types/notebook';
import { Kernel } from '../types/kernel';
import { DEFAULT_GATEWAY_URI } from '../constants/jupyter';
import {
  ImmutableChatMessage,
  ImmutableChatMessageFactory,
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
  filterAccessLevelsFromList,
  filterUidsFromList,
  makeNotebookAccessLevelsImmutable,
  makeWorkshopAccessLevelsImmutable,
  reduceImmutableNotebook,
  reduceNotebookContents,
  sortOutputByMessageIndex,
} from '../utils/notebook';
import { RecentKernelGatewaysStorage } from '../utils/storage';
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
  getNotebooksTimestamp: number | null;
  /**
   * If the editor is currently fetching the latest workshops
   */
  isGettingWorkshops: boolean;
  /**
   * Error message if fetching the workshops fails
   */
  getWorkshopsErrorMessage: string;
  /**
   * The timestamp of the last time the workshops were fetched
   */
  getWorkshopsTimestamp: number | null;
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
   * If the editor is unsharing a notebook
   */
  isUnsharingNotebook: boolean;
  /**
   * If the editor is releasing a workshop
   */
  isReleasingWorkshop: boolean;
  /**
   * If the editor is sending a message
   */
  isSendingMessage: boolean;

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
  lockedCells: ImmutableMapOf<EditorCell['cell_id'], ImmutableLock>;

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
  notebooks: ImmutableMapOf<Notebook['nb_id'], ImmutableNotebook>;
  /**
   * A list of workshops the user has access to without their contents
   */
  workshops: ImmutableMapOf<Workshop['ws_id'], ImmutableWorkshop>;

  /**
   * The currently open notebook with ordered `cell_id`'s
   */
  notebook: ImmutableReducedNotebook | null;
  /**
   * A map of `cell_id`'s to cells in the currently open notebook
   */
  cells: ImmutableMapOf<EditorCell['cell_id'], ImmutableEditorCell>;

  /**
   * The `uid` to view outputs for
   */
  selectedOutputsUid: string;
  /**
   * A map of `cell_id`'s to a map of `uid` to a map of runIndex (as a string) to a list of outputs for each cell.
   *
   * Use an empty string as the key for the current user
   */
  outputs: ImmutableMapOf<
    EditorCell['cell_id'],
    ImmutableMapOf<DUser['uid'], ImmutableMapOf<string, ImmutableList<ImmutableKernelOutput>>>
  >;
  /**
   * A map of `cell_id`'s to a map of `uid` to the output metadata
   */
  outputsMetadata: ImmutableMapOf<EditorCell['cell_id'], ImmutableMapOf<DUser['uid'], ImmutableOutputMetadata>>;

  /**
   * A list of users who are active
   */
  users: ImmutableList<ImmutableUser>;
  /**
   * A list of logs from various kernel interactions
   */
  logs: ImmutableList<ImmutableKernelLog>;

  /**
   * A list of chat messages
   */
  messages: ImmutableList<ImmutableChatMessage>;
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
  isGettingWorkshops: false,
  getWorkshopsErrorMessage: '',
  getWorkshopsTimestamp: null,
  isCreatingNotebook: false,
  isOpeningNotebook: false,
  openingNotebookId: '',
  isSharingNotebook: false,
  isUnsharingNotebook: false,
  isReleasingWorkshop: false,
  isSendingMessage: false,

  isAddingCell: false,
  isDeletingCell: false,
  isEditingCell: false,
  isExecutingCode: false,

  lockingCellId: '',
  unlockingCellId: '',
  lockedCells: ImmutableMap() as ImmutableMapOf<EditorCell['cell_id'], ImmutableLock>,

  selectedCellId: '',
  executionCount: 0,
  runningCellId: '',
  runQueue: ImmutableList(),

  gatewayUri: RecentKernelGatewaysStorage.last() ?? DEFAULT_GATEWAY_URI,
  kernel: null,

  notebooks: ImmutableMap() as ImmutableMapOf<Notebook['nb_id'], ImmutableNotebook>,
  workshops: ImmutableMap() as ImmutableMapOf<Workshop['ws_id'], ImmutableWorkshop>,

  notebook: null,
  cells: ImmutableMap() as ImmutableMapOf<EditorCell['cell_id'], ImmutableEditorCell>,

  selectedOutputsUid: '',
  outputs: ImmutableMap() as ImmutableMapOf<
    EditorCell['cell_id'],
    ImmutableMapOf<DUser['uid'], ImmutableMapOf<string, ImmutableList<ImmutableKernelOutput>>>
  >,
  outputsMetadata: ImmutableMap() as ImmutableMapOf<
    EditorCell['cell_id'],
    ImmutableMapOf<DUser['uid'], ImmutableOutputMetadata>
  >,

  users: ImmutableList(),
  logs: ImmutableList(),

  messages: ImmutableList(),
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
        getNotebooksTimestamp: Date.now(),
        notebooks: ImmutableMap<Notebook['nb_id'], ImmutableNotebook>().withMutations((mtx) =>
          action.notebooks.forEach((notebook) =>
            mtx.set(
              notebook.nb_id,
              new ImmutableNotebookFactory({
                ...notebook,
                users: makeNotebookAccessLevelsImmutable(notebook.users),
              })
            )
          )
        ),
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
     * Started fetching the user's workshops
     */
    case WORKSHOPS.GET.START:
      return {
        ...state,
        isGettingWorkshops: true,
        getWorkshopsErrorMessage: '',
      };
    /**
     * Fetched the users workshops successfully
     */
    case WORKSHOPS.GET.SUCCESS:
      return {
        ...state,
        isGettingWorkshops: false,
        getWorkshopsTimestamp: Date.now(),
        workshops: ImmutableMap<Workshop['ws_id'], ImmutableWorkshop>().withMutations((mtx) =>
          action.workshops.forEach((workshop) =>
            mtx.set(
              workshop.ws_id,
              new ImmutableWorkshopFactory({
                ...workshop,
                instructors: makeWorkshopAccessLevelsImmutable(workshop.instructors),
                attendees: makeWorkshopAccessLevelsImmutable(workshop.attendees),
                main_notebook: new ImmutableNotebookFactory({
                  ...workshop.main_notebook,
                  users: makeNotebookAccessLevelsImmutable(workshop.main_notebook.users),
                }),
              })
            )
          )
        ),
      };
    /**
     * Failed to get the users workshops
     */
    case WORKSHOPS.GET.FAILURE:
      return {
        ...state,
        isGettingWorkshops: false,
        getWorkshopsErrorMessage: action.error.message,
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
        notebooks: state.notebooks.set(
          action.notebook.nb_id,
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
        workshops: state.workshops.set(
          action.workshop.ws_id,
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
        isSendingMessage: false,
        openingNotebookId: '',
        lockingCellId: '',
        unlockingCellId: '',
        selectedCellId: '',
        selectedOutputsUid: '',
        lockedCells: ImmutableMap<EditorCell['cell_id'], ImmutableLock>().withMutations((mtx) =>
          dcells
            .filter((dcell) => (dcell.lock_held_by ?? '') !== '')
            .forEach((dcell) =>
              mtx.set(
                dcell.cell_id,
                new ImmutableLockFactory({
                  cell_id: dcell.cell_id,
                  uid: dcell.lock_held_by ?? '',
                })
              )
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
        messages: state.messages.clear(),
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
    case NOTEBOOKS.ACCESS.CONNECT: {
      const user = state.notebooks.get(action.nb_id)?.users.find((user) => user.uid === action.uid);

      if (!user) {
        return state;
      }

      const userIndex = state.users.findIndex((user) => user.uid === action.uid);

      return {
        ...state,
        users: (userIndex !== -1 ? state.users.remove(userIndex) : state.users).push(new ImmutableUserFactory(user)),
      };
    }
    /**
     * A user has closed the notebook
     */
    case NOTEBOOKS.ACCESS.DISCONNECT: {
      if (!action.isMe) {
        const userIndex = state.users.findIndex((user) => user.uid === action.uid);

        return {
          ...state,
          users: userIndex !== -1 ? state.users.remove(userIndex) : state.users,
        };
      }

      return {
        ...state,
        isSharingNotebook: false,
        isUnsharingNotebook: false,
        isReleasingWorkshop: false,
        isSendingMessage: false,
        lockingCellId: '',
        unlockingCellId: '',
        selectedCellId: '',
        selectedOutputsUid: '',
        isAddingCell: false,
        isDeletingCell: false,
        isEditingCell: false,
        notebook: null,
        cells: state.cells.clear(),
        users: state.users.clear(),
        outputs: state.outputs.clear(),
        outputsMetadata: state.outputsMetadata.clear(),
        messages: state.messages.clear(),
      };
    }

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
      if (!state.notebooks.has(action.nb_id)) {
        return {
          ...state,
          isSharingNotebook: action.isMe ? false : state.isSharingNotebook,
        };
      }

      return {
        ...state,
        isSharingNotebook: action.isMe ? false : state.isSharingNotebook,
        notebooks: state.notebooks.update(action.nb_id, (notebook) =>
          notebook?.set(
            'users',
            notebook.users
              .filter(filterAccessLevelsFromList(action.users))
              .concat(makeNotebookAccessLevelsImmutable(action.users))
          )
        ),
        notebook:
          state.notebook?.nb_id === action.nb_id
            ? state.notebook.set(
                'users',
                state.notebook.users
                  .filter(filterAccessLevelsFromList(action.users))
                  .concat(makeNotebookAccessLevelsImmutable(action.users))
              )
            : state.notebook,
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
     * Started sharing a workshop
     */
    case WORKSHOPS.SHARE.START:
      return {
        ...state,
        isSharingNotebook: true,
      };
    /**
     * Successfully shared a workshop
     */
    case WORKSHOPS.SHARE.SUCCESS: {
      if (!state.workshops.has(action.ws_id)) {
        return {
          ...state,
          isSharingNotebook: action.isMe ? false : state.isSharingNotebook,
        };
      }

      return {
        ...state,
        isSharingNotebook: action.isMe ? false : state.isSharingNotebook,
        workshops: state.workshops.update(action.ws_id, (workshop) =>
          workshop?.withMutations((mtx) =>
            mtx
              .set(
                'instructors',
                workshop.instructors
                  .filter(filterAccessLevelsFromList(action.access_levels.instructors, action.access_levels.attendees))
                  .concat(makeWorkshopAccessLevelsImmutable(action.access_levels.instructors))
              )
              .set(
                'attendees',
                workshop.attendees
                  .filter(filterAccessLevelsFromList(action.access_levels.instructors, action.access_levels.attendees))
                  .concat(makeWorkshopAccessLevelsImmutable(action.access_levels.attendees))
              )
          )
        ),
      };
    }
    /**
     * Failed to share a workshop
     */
    case WORKSHOPS.SHARE.FAILURE:
      return {
        ...state,
        isSharingNotebook: false,
      };

    /**
     * Started unsharing a notebook
     */
    case NOTEBOOKS.UNSHARE.START:
      return {
        ...state,
        isUnsharingNotebook: true,
      };
    /**
     * Successfully unshared a notebook
     */
    case NOTEBOOKS.UNSHARE.SUCCESS: {
      if (!state.notebooks.has(action.nb_id)) {
        return {
          ...state,
          isUnsharingNotebook: action.isMe ? false : state.isUnsharingNotebook,
        };
      }

      return {
        ...state,
        isUnsharingNotebook: action.isMe ? false : state.isUnsharingNotebook,
        notebooks: action.includedMe
          ? state.notebooks.remove(action.nb_id)
          : state.notebooks.update(action.nb_id, (notebook) =>
              notebook?.set('users', notebook.users.filter(filterUidsFromList(action.uids)))
            ),
        notebook:
          state.notebook?.nb_id === action.nb_id
            ? action.includedMe
              ? null
              : state.notebook.set('users', state.notebook.users.filter(filterUidsFromList(action.uids)))
            : state.notebook,
      };
    }
    /**
     * Failed to unshare a notebook
     */
    case NOTEBOOKS.UNSHARE.FAILURE:
      return {
        ...state,
        isUnsharingNotebook: false,
      };

    /**
     * Started to released a workshop
     */
    case WORKSHOPS.RELEASE.START:
      return {
        ...state,
        isReleasingWorkshop: true,
      };
    /**
     * Successfully released a workshop
     */
    case WORKSHOPS.RELEASE.SUCCESS:
      return {
        ...state,
        isReleasingWorkshop: action.isMe ? false : state.isReleasingWorkshop,
        workshops: state.workshops.has(action.ws_id)
          ? state.workshops.update(action.ws_id, (workshop) => workshop?.set('start_time', Date.now()))
          : state.workshops,
      };
    /**
     * Failed to release a workshop
     */
    case WORKSHOPS.RELEASE.FAILURE:
      return {
        ...state,
        isReleasingWorkshop: false,
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
        outputs: state.outputs.update(
          action.output.cell_id,
          (
            userMap = ImmutableMap() as ImmutableMapOf<
              DUser['uid'],
              ImmutableMapOf<string, ImmutableList<ImmutableKernelOutput>>
            >
          ) =>
            userMap.update(
              action.output.uid,
              (runIndexMap = ImmutableMap() as ImmutableMapOf<string, ImmutableList<ImmutableKernelOutput>>) =>
                runIndexMap.set(
                  metadata.runIndex.toString(),
                  ImmutableList(messages.map((message) => new ImmutableKernelOutputFactory(message)))
                )
            )
        ),
        outputsMetadata: state.outputsMetadata.update(
          action.output.cell_id,
          (userMap = ImmutableMap() as ImmutableMapOf<DUser['uid'], ImmutableOutputMetadata>) =>
            userMap.set(
              action.output.uid,
              new ImmutableOutputMetadataFactory({
                runIndex: metadata.runIndex,
                running: false,
              })
            )
        ),
        notebook: state.notebook ? state.notebook.set('time_modified', Date.now()) : state.notebook,
      };
    }

    /**
     * Started sending a message
     */
    case NOTEBOOKS.SEND_MESSAGE.START:
      return {
        ...state,
        isSendingMessage: true,
      };
    /**
     * Successfully sent a message
     */
    case NOTEBOOKS.SEND_MESSAGE.SUCCESS:
      return {
        ...state,
        isSendingMessage: action.isMe ? false : state.isSendingMessage,
        messages: state.messages.push(new ImmutableChatMessageFactory(action.message)),
      };
    /**
     * Failed to send a message
     */
    case NOTEBOOKS.SEND_MESSAGE.FAILURE:
      return {
        ...state,
        isSendingMessage: false,
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
        lockedCells: state.lockedCells.set(
          action.cell_id,
          new ImmutableLockFactory({
            uid: action.uid,
            cell_id: action.cell_id,
          })
        ),
        cells: state.cells.update(action.cell_id, (cell = new ImmutableEditorCellFactory()) => cell.merge(action.cell)),
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
        lockedCells: state.lockedCells.remove(action.cell_id),
        cells: state.cells.update(action.cell_id, (cell = new ImmutableEditorCellFactory()) => cell.merge(action.cell)),
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
        notebooks: state.notebooks.update(action.cell.nb_id, (notebook) => notebook?.set('time_modified', Date.now())),
        notebook: state.notebook
          .update('cell_ids', (cell_ids) =>
            cell_ids.splice(action.index === -1 ? notebook.cell_ids.size ?? 0 : action.index, 0, action.cell_id)
          )
          .set('time_modified', Date.now()),
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

      const runQueueIndex = state.runQueue.findIndex((cell_id: string) => cell_id === action.cell_id);

      return {
        ...state,
        ...selectionChanges,
        isDeletingCell: action.isMe ? false : state.isDeletingCell,
        lockedCells: state.lockedCells.remove(action.cell_id),
        cells: state.cells.delete(action.cell_id),
        outputs: state.outputs.remove(action.cell_id),
        runQueue: runQueueIndex !== -1 ? state.runQueue.remove(runQueueIndex) : state.runQueue,
        notebooks: state.notebooks.update(action.nb_id, (notebook) => notebook?.set('time_modified', Date.now())),
        notebook: state.notebook.set('time_modified', Date.now()),
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
        const runQueueIndex = state.runQueue.findIndex((cell_id) => cell_id === action.cell_id);

        if (runQueueIndex !== -1) {
          runQueueChanges.runQueue = state.runQueue.remove(runQueueIndex);
        }
      }

      return {
        ...state,
        ...runQueueChanges,
        isEditingCell: true,
        cells: state.cells.update(action.cell_id, (value = new ImmutableEditorCellFactory()) =>
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
          notebooks: state.notebooks.update(action.cell.nb_id, (notebook) =>
            notebook?.set('time_modified', Date.now())
          ),
          notebook: state.notebook ? state.notebook.set('time_modified', Date.now()) : state.notebook,
        };
      }

      const oldDate = state.cells.get(action.cell_id)?.time_modified ?? -1;
      const newDate = action.cell.time_modified;
      const changesAreNewer = newDate > oldDate;

      const runQueueChanges: Partial<EditorState> = {};

      // If a cell in the runQueue is no longer python, it should not be executed
      if (changesAreNewer && action.cell.language === 'markdown') {
        const runQueueIndex = state.runQueue.findIndex((cell_id) => cell_id === action.cell_id);

        if (runQueueIndex !== -1) {
          runQueueChanges.runQueue = state.runQueue.remove(runQueueIndex);
        }
      }

      return {
        ...state,
        ...runQueueChanges,
        cells: changesAreNewer
          ? state.cells.update(action.cell_id, (value = new ImmutableEditorCellFactory()) => value.merge(action.cell))
          : state.cells,
        notebooks: state.notebooks.update(action.cell.nb_id, (notebook) => notebook?.set('time_modified', Date.now())),
        notebook: state.notebook ? state.notebook.set('time_modified', Date.now()) : state.notebook,
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
        cells: state.cells.update(action.cell_id, (value = new ImmutableEditorCellFactory()) =>
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

      const runQueueIndex = state.runQueue.findIndex((cell_id: string) => cell_id === action.cell_id);

      return {
        ...state,
        runQueue: (runQueueIndex !== -1 ? state.runQueue.remove(runQueueIndex) : state.runQueue).push(action.cell_id),
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

      const runQueueIndex = state.runQueue.findIndex((cell_id: string) => cell_id === action.cell.cell_id);

      return {
        ...state,
        kernel:
          state.kernel !== null
            ? {
                ...state.kernel,
                status: 'Busy',
              }
            : null,
        runQueue: runQueueIndex !== -1 ? state.runQueue.remove(runQueueIndex) : state.runQueue,
        isExecutingCode: true,
        runningCellId: action.cell.cell_id,
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
        cells: state.cells.update(action.cell_id, (value = new ImmutableEditorCellFactory()) =>
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
        cells: state.cells.update(action.cell_id, (value = new ImmutableEditorCellFactory()) =>
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
        outputs: state.outputs.update(
          action.cell_id,
          (
            userMap = ImmutableMap() as ImmutableMapOf<
              DUser['uid'],
              ImmutableMapOf<string, ImmutableList<ImmutableKernelOutput>>
            >
          ) =>
            userMap.update(
              '',
              (runIndexMap = ImmutableMap() as ImmutableMapOf<string, ImmutableList<ImmutableKernelOutput>>) =>
                runIndexMap.update(action.runIndex.toString(), (outputs = ImmutableList()) =>
                  outputs
                    .concat(
                      ImmutableList<ImmutableKernelOutput>(
                        action.messages.map<ImmutableKernelOutput>(
                          (message) => new ImmutableKernelOutputFactory(message)
                        )
                      )
                    )
                    .sort(sortOutputByMessageIndex)
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
        cells: state.cells.update(action.cell_id, (value = new ImmutableEditorCellFactory()) =>
          value.set('runIndex', action.runIndex > state.executionCount ? action.runIndex : value.runIndex)
        ),
      };
    default:
      return state;
  }
};

export default reducer;
