import { DCell, Notebook, NotebookAccessLevel, NotebookContents } from '@actually-colab/editor-types';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import { saveAs } from 'file-saver';

import { IpynbCell, IpynbNotebook, IpynbOutput } from '../types/ipynb';
import { EditorCell, KernelOutput, ReducedNotebook } from '../types/notebook';
import { User } from '../types/user';
import {
  ImmutableEditorCell,
  ImmutableEditorCellFactory,
  ImmutableKernelOutput,
  ImmutableNotebook,
  ImmutableNotebookAccessLevel,
  ImmutableNotebookAccessLevelFactory,
  ImmutableReducedNotebook,
  ImmutableReducedNotebookFactory,
} from '../immutable';
import { filterUndefined } from './filter';
import { splitKeepNewlines } from './regex';

/**
 * A comparator for sorting kernel outputs by their message indices
 */
export const sortImmutableOutputByMessageIndex = (a: ImmutableKernelOutput, b: ImmutableKernelOutput) =>
  a.messageIndex - b.messageIndex;

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
  notebook !== null ? new ImmutableReducedNotebookFactory(notebook.toObject()) : null;

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
 * Convert an array of access levels to an immutable list of immutable access levels
 */
export const makeAccessLevelsImmutable = (users: NotebookAccessLevel[]): ImmutableList<ImmutableNotebookAccessLevel> =>
  ImmutableList(users.map((user) => new ImmutableNotebookAccessLevelFactory(user)));

/**
 * Given a DCell, make sure all values exist
 */
export const cleanDCell = (cell: DCell): Required<DCell> => {
  return {
    ...cell,
    cursor_pos: cell.cursor_pos ?? null,
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

  map = map.withMutations((map) => {
    cells.forEach((cell) => {
      map = map.set(cell.cell_id, new ImmutableEditorCellFactory(cell));
    });
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
    cell.language === 'markdown'
      ? {
          cell_type: 'markdown',
          metadata: {},
          source: splitKeepNewlines(cell.contents),
        }
      : {
          cell_type: 'code',
          execution_count: cell.runIndex !== -1 ? cell.runIndex : null,
          metadata: {
            tags: [],
          },
          outputs:
            outputs
              ?.map<IpynbOutput>((output) =>
                filterUndefined<IpynbOutput & { transient?: any }, IpynbOutput>({
                  ...output.output,
                  transient: undefined,
                })
              )
              ?.toJS() ?? [],
          source: splitKeepNewlines(cell.contents),
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

  notebook.cell_ids.forEach((cell_id) => {
    const cell = cells.get(cell_id);
    const cellOutputs = outputs.get(cell_id);

    if (cell) {
      notebookData.push({
        cell,
        outputs: cellOutputs
          ?.filter((output) => output.uid === uid && output.runIndex === cell.runIndex)
          ?.sort(sortImmutableOutputByMessageIndex),
      });
    }
  });

  const ipynb = convertToIpynb(notebookData);

  const blob = new Blob([JSON.stringify(ipynb)], {
    type: 'charset=utf-8',
  });

  saveAs(blob, `${notebook.name}.ipynb`);
};
