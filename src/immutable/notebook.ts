import { Notebook, NotebookAccessLevel } from '@actually-colab/editor-types';
import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';

import { RemoveIndex } from '../types/generics';
import { ImmutableRecordOf } from '../types/immutable';
import { EditorCell, KernelOutput, Lock, ReducedNotebook } from '../types/notebook';

/**
 * An Immutable Record for a kernel output
 */
export type ImmutableKernelOutput = ImmutableRecordOf<Required<KernelOutput>>;
/**
 * An Immutable Record Factory for a kernel output
 */
export const ImmutableKernelOutputFactory = ImmutableRecord<Required<KernelOutput>>({
  uid: '',
  output_id: '',
  cell_id: '',
  runIndex: -1,
  messageIndex: -1,
  output: {
    output_type: 'error',
    ename: 'No output',
    evalue: 'No output',
    traceback: [],
  },
});

/**
 * An Immutable Record for an editor cell
 */
export type ImmutableEditorCell = ImmutableRecordOf<Required<EditorCell>>;
/**
 * An Immutable Record Factory for an editor cell
 */
export const ImmutableEditorCellFactory = ImmutableRecord<Required<EditorCell>>({
  nb_id: '',
  lock_held_by: null,
  cell_id: '',
  time_modified: -1,
  contents: '',
  cursor_pos: null,
  language: 'python',
  position: -1,
  rendered: true,
  runIndex: -1,
  selectedOutputsRunIndex: -1,
});

/**
 * An Immutable Record for a lock
 */
export type ImmutableLock = ImmutableRecordOf<Required<Lock>>;
/**
 * An Immutable Record Factory for a lock
 */
export const ImmutableLockFactory = ImmutableRecord<Required<Lock>>({
  uid: '',
  cell_id: '',
});

/**
 * An Immutable Record for an access level
 */
export type ImmutableNotebookAccessLevel = ImmutableRecordOf<RemoveIndex<Required<NotebookAccessLevel>>>;
/**
 * An Immutable Record Factory for an access level
 */
export const ImmutableNotebookAccessLevelFactory = ImmutableRecord<RemoveIndex<Required<NotebookAccessLevel>>>({
  uid: '',
  name: '',
  email: '',
  image_url: '',
  access_level: 'Read Only',
});

/**
 * The in-between type for converting a notebook to an Immutable
 */
export type PseudoImmutableNotebook = Omit<RemoveIndex<Notebook>, 'users'> & {
  users: ImmutableList<ImmutableNotebookAccessLevel>;
};
/**
 * An Immutable Record for a notebook
 */
export type ImmutableNotebook = ImmutableRecordOf<Required<PseudoImmutableNotebook>>;
/**
 * An Immutable Record Factory for a notebook
 */
export const ImmutableNotebookFactory = ImmutableRecord<Required<PseudoImmutableNotebook>>({
  nb_id: '',
  name: '',
  language: 'python',
  time_modified: Date.now(),
  users: ImmutableList(),
});

/**
 * The in-between type for converting a reduced notebook to an Immutable
 */
export type PseudoImmutableReducedNotebook = Omit<ReducedNotebook, 'users' | 'cell_ids'> & {
  users: ImmutableList<ImmutableNotebookAccessLevel>;
  cell_ids: ImmutableList<EditorCell['cell_id']>;
};
/**
 * An Immutable Record for a reduced notebook
 */
export type ImmutableReducedNotebook = ImmutableRecordOf<Required<PseudoImmutableReducedNotebook>>;
/**
 * An Immutable Record Factory for a reduced notebook
 */
export const ImmutableReducedNotebookFactory = ImmutableRecord<Required<PseudoImmutableReducedNotebook>>({
  nb_id: '',
  name: '',
  language: 'python',
  time_modified: Date.now(),
  users: ImmutableList(),
  cell_ids: ImmutableList(),
});
