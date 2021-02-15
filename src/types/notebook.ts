export type KernelOutput =
  | {
      _id: string;
      cellId: string;
      runIndex: number;
      messageIndex: number;
      name: 'stdout';
      data: {
        text: string;
      };
    }
  | {
      _id: string;
      cellId: string;
      runIndex: number;
      messageIndex: number;
      name: 'display_data';
      data: {
        text?: string;
        image?: string;
      };
    };

export type EditorCell = {
  _id: string;
  runIndex: number;
  active: boolean;
  code: string;
};

export type Notebook = {
  _id: string;
  name: string;
  collaborators: string[];
  readOnly: boolean;
  cells: EditorCell[];
};
