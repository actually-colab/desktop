export type KernelOutput =
  | {
      _id: string;
      name: 'stdout';
      data: {
        text: string;
      };
    }
  | {
      _id: string;
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
  output: KernelOutput[];
};
