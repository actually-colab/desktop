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
    >;

export type EditorCell = {
  cell_id: string;
  language: 'py' | 'md';
  editing: boolean;
  runIndex: number;
  active: boolean;
  code: string;
};

export type Notebook = {
  nb_id: string;
  name: string;
  user: User[];
  access_level: 'Full Access' | 'Read Only';
  cells: EditorCell[];
};
