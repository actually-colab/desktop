import { Notebook, NotebookAccessLevel } from '@actually-colab/editor-types';
import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';

import { RemoveIndex } from '../../types/generics';
import { ImmutableRecordOf } from '../../types/immutable';
import { EditorCell, KernelOutput, Lock, ReducedNotebook } from '../../types/notebook';

export type ImmutableKernelOutput = ImmutableRecordOf<KernelOutput>;
export const ImmutableKernelOutputFactory = ImmutableRecord<KernelOutput>({
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

export type ImmutableEditorCell = ImmutableRecordOf<EditorCell>;
export const ImmutableEditorCellFactory = ImmutableRecord<EditorCell>({
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
});

export type ImmutableLock = ImmutableRecordOf<Lock>;
export const ImmutableLockFactory = ImmutableRecord<Lock>({
  uid: '',
  cell_id: '',
});

export type ImmutableNotebookAccessLevel = ImmutableRecordOf<RemoveIndex<NotebookAccessLevel>>;
export const ImmutableNotebookAccessLevelFactory = ImmutableRecord<RemoveIndex<NotebookAccessLevel>>({
  uid: '',
  name: '',
  email: '',
  access_level: 'Read Only',
});

export type PseudoImmutableNotebook = Omit<RemoveIndex<Notebook>, 'users'> & {
  users: ImmutableList<ImmutableNotebookAccessLevel>;
};
export type ImmutableNotebook = ImmutableRecordOf<PseudoImmutableNotebook>;
export const ImmutableNotebookFactory = ImmutableRecord<PseudoImmutableNotebook>({
  nb_id: '',
  name: '',
  language: 'python',
  users: ImmutableList(),
});

export type PseudoImmutableReducedNotebook = Omit<ReducedNotebook, 'users' | 'cell_ids'> & {
  users: ImmutableList<ImmutableNotebookAccessLevel>;
  cell_ids: ImmutableList<EditorCell['cell_id']>;
};
export type ImmutableReducedNotebook = ImmutableRecordOf<PseudoImmutableReducedNotebook>;
export const ImmutableReducedNotebookFactory = ImmutableRecord<PseudoImmutableReducedNotebook>({
  nb_id: '',
  name: '',
  language: 'python',
  users: ImmutableList(),
  cell_ids: ImmutableList(),
});
