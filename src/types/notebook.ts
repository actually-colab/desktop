import { List as ImmutableList } from 'immutable';
import { DCell, Notebook, NotebookAccessLevel } from '@actually-colab/editor-client';

import { ImmutableObject } from './immutable';
import { IpynbOutput } from './ipynb';
import { User } from './user';

export type BaseKernelOutput = {
  uid: User['uid'];
  output_id: string;
  cell_id: EditorCell['cell_id'];
  /**
   * The run index this message is from
   */
  runIndex: number;
  /**
   * The index of this message in the output of the current run
   */
  messageIndex: number;
};

/**
 * An output from the kernel
 */
export type KernelOutput = BaseKernelOutput & {
  output: IpynbOutput;
};

export type ImmutableKernelOutput = ImmutableObject<KernelOutput>;

/**
 * An editor cell in a notebook
 */
export type EditorCell = Required<DCell> & {
  /**
   * If the cell is markdown, this indicates if the markdown is rendered or editable
   */
  rendered: boolean;
  /**
   * The latest execution count associated with this cell
   */
  runIndex: number;
};

export type ImmutableEditorCell = ImmutableObject<EditorCell>;

/**
 * A lock that indicates which user owns which cell
 */
export type Lock = {
  uid: User['uid'];
  cell_id: EditorCell['cell_id'];
};

export type ImmutableLock = ImmutableObject<Lock>;

export type ImmutableNotebookAccessLevel = ImmutableObject<NotebookAccessLevel>;

export type PseudoImmutableNotebook = Omit<Notebook, 'users'> & {
  users: ImmutableList<ImmutableNotebookAccessLevel>;
};

export type ImmutableNotebook = ImmutableObject<PseudoImmutableNotebook>;

/**
 * Notebooks are separated so the cells are stored in redux on their own
 */
export type ReducedNotebook = Notebook & {
  cell_ids: EditorCell['cell_id'][];
};

export type PseudoImmutableReducedNotebook = Omit<ReducedNotebook, 'users' | 'cell_ids'> & {
  users: ImmutableList<ImmutableNotebookAccessLevel>;
  cell_ids: ImmutableList<EditorCell['cell_id']>;
};

export type ImmutableReducedNotebook = ImmutableObject<PseudoImmutableReducedNotebook>;
