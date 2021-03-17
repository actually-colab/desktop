import { DCell, Notebook, NotebookContents } from '@actually-colab/editor-client';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import { saveAs } from 'file-saver';

import { IpynbCell, IpynbNotebook, IpynbOutput } from '../types/ipynb';
import {
  EditorCell,
  ImmutableEditorCell,
  ImmutableKernelOutput,
  ImmutableNotebook,
  ImmutableReducedNotebook,
  KernelOutput,
  ReducedNotebook,
} from '../types/notebook';
import { User } from '../types/user';
import { BASE_CELL } from '../constants/notebook';
import { filterUndefined } from './filter';
import { SPLIT_KEEP_NEWLINE } from './regex';
import { makeImmutableEditorCell, makeImmutableReducedNotebook } from './immutable/notebook';

/**
 * A comparator for sorting kernel outputs by their message indices
 */
export const sortImmutableOutputByMessageIndex = (a: ImmutableKernelOutput, b: ImmutableKernelOutput) =>
  a.get('messageIndex') - b.get('messageIndex');

/**
 * A comparator for sorting immutable kernel outputs by their message indices
 */
export const sortOutputByMessageIndex = (a: KernelOutput, b: KernelOutput) => a.messageIndex - b.messageIndex;

/**
 * Convert a notebook to a reduced notebook
 */
export const reduceNotebook = (notebook: Notebook): ReducedNotebook => ({
  ...notebook,
  cell_ids: [],
});

/**
 * Convert an immutable notebook to an immutable reduced notebook
 */
export const reduceImmutableNotebook = (notebook: ImmutableNotebook | null) =>
  notebook !== null ? makeImmutableReducedNotebook(reduceNotebook(notebook.toJS() as any)) : null;

/**
 * Convert a notebook contents object to a reduced notebook
 */
export const reduceNotebookContents = (notebook: NotebookContents): ReducedNotebook => {
  const { cells, ...rest } = notebook;

  return {
    ...rest,
    cell_ids: Object.values(cells)
      .sort((a, b) => a.position - b.position)
      .map((cell) => cell.cell_id),
  };
};

/**
 * Given a DCell, make sure all values exist
 */
export const cleanDCell = (cell: DCell): Required<DCell> => {
  return {
    ...cell,
    lock_held_by: cell.lock_held_by ?? '',
  };
};

/**
 * Convert an array of cells to a dictionary
 */
export const cellArrayToImmutableMap = (
  cells: DCell[] | EditorCell[]
): ImmutableMap<EditorCell['cell_id'], ImmutableEditorCell> => {
  let map = ImmutableMap<EditorCell['cell_id'], ImmutableEditorCell>();

  cells.forEach((cell) => {
    map = map.set(cell.cell_id, makeImmutableEditorCell({ ...BASE_CELL, ...cell }));
  });

  return map;
};

/**
 * Given a cells and output, convert the notebook to a JSON ipynb format
 */
const convertToIpynb = (
  notebookCells: {
    cell: ImmutableEditorCell;
    outputs?: ImmutableList<ImmutableKernelOutput>;
  }[]
): IpynbNotebook => ({
  nbformat: 4,
  nbformat_minor: 1,
  metadata: {
    kernelspec: {
      display_name: 'Python 3',
      language: 'python',
      name: 'python3',
    },
    language_info: {
      codemirror_mode: {
        name: 'ipython',
        version: 3,
      },
      file_extension: '.py',
      mimetype: 'text/x-python',
      name: 'python',
      pygments_lexer: 'ipython3',
    },
  },
  cells: notebookCells.map<IpynbCell>(({ cell, outputs }) =>
    cell.get('language') === 'markdown'
      ? {
          cell_type: 'markdown',
          metadata: {},
          source: cell.get('contents').split(SPLIT_KEEP_NEWLINE),
        }
      : {
          cell_type: 'code',
          execution_count: cell.get('runIndex') !== -1 ? cell.get('runIndex') : null,
          metadata: {
            tags: [],
          },
          outputs:
            outputs
              ?.map<IpynbOutput>((output) =>
                filterUndefined<IpynbOutput & { transient?: any }, IpynbOutput>({
                  ...output.get('output'),
                  transient: undefined,
                })
              )
              ?.toJS() ?? [],
          source: cell.get('contents').split(SPLIT_KEEP_NEWLINE),
        }
  ),
});

/**
 * Download the given notebook data to an ipynb file. Only include outputs with the given uid and latest run index
 */
export const download = (
  notebook: ImmutableReducedNotebook,
  uid: User['uid'],
  cells: ImmutableMap<EditorCell['cell_id'], ImmutableEditorCell>,
  outputs: ImmutableMap<EditorCell['cell_id'], ImmutableList<ImmutableKernelOutput>>
) => {
  const notebookData: { cell: ImmutableEditorCell; outputs?: ImmutableList<ImmutableKernelOutput> }[] = [];

  notebook.get('cell_ids').forEach((cell_id) => {
    const cell = cells.get(cell_id);
    const cellOutputs = outputs.get(cell_id);

    if (cell) {
      notebookData.push({
        cell,
        outputs: cellOutputs
          ?.filter((output) => output.get('uid') === uid && output.get('runIndex') === cell.get('runIndex'))
          ?.sort(sortImmutableOutputByMessageIndex),
      });
    }
  });

  const ipynb = convertToIpynb(notebookData);

  const blob = new Blob([JSON.stringify(ipynb)], {
    type: 'charset=utf-8',
  });

  saveAs(blob, `${notebook.get('name')}.ipynb`);
};
