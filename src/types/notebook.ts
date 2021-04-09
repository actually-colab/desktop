import { DCell, Notebook, DUser } from '@actually-colab/editor-types';

import { IpynbOutput } from './ipynb';
import { RemoveIndex } from './generics';

export type BaseKernelOutput = {
  uid: DUser['uid'];
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
 * Metadata to identify an output with
 */
export type OutputMetadata = {
  runIndex: number;
  running: boolean;
};

/**
 * An output without metadata
 */
export type MinimalKernelOutput = Omit<KernelOutput, 'uid' | 'cell_id' | 'runIndex'>;

/**
 * A payload containing metadata and an array of minimal outputs generated from an OOutput received from a client
 */
export type ReceivableKernelOutputPayload = {
  metadata: {
    uid: string;
    nb_id: string;
    cell_id: string;
    runIndex: number;
  };
  messages: KernelOutput[];
};

/**
 * A payload containing metadata and an array of minimal outputs to send to the client
 */
export type SendableKernelOutputPayload = {
  metadata: {
    runIndex: number;
  };
  messages: MinimalKernelOutput[];
};

export type EditorCellMeta = {
  /**
   * If the cell is markdown, this indicates if the markdown is rendered or editable
   */
  rendered: boolean;
  /**
   * The latest execution count associated with this cell
   */
  runIndex: number;
};

/**
 * An editor cell in a notebook
 */
export type EditorCell = Required<RemoveIndex<DCell>> & EditorCellMeta;

/**
 * A lock that indicates which user owns which cell
 */
export type Lock = {
  uid: DUser['uid'];
  cell_id: EditorCell['cell_id'];
};

/**
 * Notebooks are separated so the cells are stored in redux on their own
 */
export type ReducedNotebook = RemoveIndex<Notebook> & {
  cell_ids: EditorCell['cell_id'][];
};
