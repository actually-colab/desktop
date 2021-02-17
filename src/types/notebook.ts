import { User } from './user';

type BaseKernelOutput<Name, Data> = {
  uid: string;
  output_id: string;
  cell_id: string;
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
  uid: string;
  cell_id: string;
};

export type Notebook = {
  nb_id: string;
  name: string;
  user: User[];
  access_level: 'Full Access' | 'Read Only';
  cells: EditorCell[];
};
