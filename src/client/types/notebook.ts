import { User } from './user';

type BaseKernelOutput<Name, Data> = {
  uid: User['uid'];
  output_id: string;
  cell_id: EditorCell['cell_id'];
  runIndex: number;
  messageIndex: number;
  name: Name;
  data: Data;
};

export type KernelOutput =
  | BaseKernelOutput<
      'stdout',
      {
        text: string;
      }
    >
  | BaseKernelOutput<
      'display_data',
      {
        text?: string;
        image?: string;
      }
    >
  | BaseKernelOutput<
      'stderr',
      {
        ename: string;
        evalue: string;
        traceback: string[];
      }
    >;

export type EditorCell = {
  cell_id: string;
  language: 'py' | 'md';
  editing: boolean;
  runIndex: number;
  code: string;
};

export type Lock = {
  uid: User['uid'];
  cell_id: EditorCell['cell_id'];
};

export type NotebookAccessLevel = {
  nb_id: Notebook['nb_id'];
  uid: User['uid'];
  access_level: 'Full Access' | 'Read Only';
};

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
  cell_ids: string[];
};
