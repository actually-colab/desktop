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

/**
 * An editor cell in a notebook
 */
export type EditorCell = {
  cell_id: string;
  language: 'py' | 'md';
  /**
   * If the cell is markdown, this indicates if the markdown is rendered or editable
   */
  rendered: boolean;
  /**
   * The latest execution count associated with this cell
   */
  runIndex: number;
  code: string;
};

/**
 * A lock that indicates which user owns which cell
 */
export type Lock = {
  uid: User['uid'];
  cell_id: EditorCell['cell_id'];
};

/**
 * Indicates the access level for a given user on a given notebook
 */
export type NotebookAccessLevel = {
  nb_id: Notebook['nb_id'];
  uid: User['uid'];
  access_level: 'Full Access' | 'Read Only';
};

/**
 * A notebook
 */
export type Notebook = {
  nb_id: number;
  name: string;
  users: (User & { access_level: NotebookAccessLevel['access_level'] })[];
  access_level: 'Full Access' | 'Read Only';
  cells: EditorCell[];
};

/**
 * Notebooks are separated so the cells are stored in redux on their own
 */
export type ReducedNotebook = Omit<Notebook, 'cells'> & {
  cell_ids: EditorCell['cell_id'][];
};
