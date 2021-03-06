import {
  DCell,
  Notebook,
  NotebookAccessLevel,
  NotebookContents,
  DUser,
  OOutput,
  WorkshopAccessLevel,
} from '@actually-colab/editor-types';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import { saveAs } from 'file-saver';

import type { ReduxState } from '../types/redux';
import { IpynbCell, IpynbNotebook, IpynbOutput } from '../types/ipynb';
import {
  EditorCell,
  KernelOutput,
  ReceivableKernelOutputPayload,
  ReducedNotebook,
  SendableKernelOutputPayload,
} from '../types/notebook';
import {
  ImmutableEditorCell,
  ImmutableEditorCellFactory,
  ImmutableKernelOutput,
  ImmutableNotebook,
  ImmutableNotebookAccessLevel,
  ImmutableNotebookAccessLevelFactory,
  ImmutableReducedNotebook,
  ImmutableReducedNotebookFactory,
  ImmutableWorkshopAccessLevel,
  ImmutableWorkshopAccessLevelFactory,
} from '../immutable';
import { filterUndefined } from './filter';
import { splitKeepNewlines } from './regex';

/**
 * Separate comma separated string of emails into an array of emails
 */
export const separateEmails = (emailsString: string): string[] => {
  return emailsString.split(',').map((piece) => piece.trim());
};

/**
 * A configurable comparator to sort notebook types
 */
export const sortNotebookBy = (sortType: 'name' | 'modified') => (
  a: {
    name: string;
    time_modified: number;
  },
  b: {
    name: string;
    time_modified: number;
  }
): number => {
  if (sortType === 'name') {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  }

  return b.time_modified - a.time_modified;
};

/**
 * A comparator to sort users by name
 */
export const sortUsersByName = (a: { name: string }, b: { name: string }): number =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0;

/**
 * A configurable filter predicate to search for a name that includes a fragment of a name anywhere in it
 */
export const filterNotebookByName = (nameFragment: string) => (notebook: { name: string }): boolean => {
  return notebook.name.toLowerCase().includes(nameFragment.toLowerCase());
};

/**
 * A configurable filter predicate to remove any matching users that occur in provided lists
 */
export const filterAccessLevelsFromList = (...updatedLists: (NotebookAccessLevel | WorkshopAccessLevel)[][]) => (
  user: ImmutableNotebookAccessLevel | ImmutableWorkshopAccessLevel
): boolean => {
  for (const updated of updatedLists) {
    if (updated.findIndex((_user) => _user.uid === user.uid) !== -1) {
      return false;
    }
  }

  return true;
};

/**
 * A configurable filter predicate to remove any matching uids that occur in provided lists
 */
export const filterUidsFromList = (...updatedLists: string[][]) => (
  user: ImmutableNotebookAccessLevel | ImmutableWorkshopAccessLevel
): boolean => {
  for (const updated of updatedLists) {
    if (updated.findIndex((uid) => uid === user.uid) !== -1) {
      return false;
    }
  }

  return true;
};

/**
 * A comparator for sorting kernel outputs by their message indices
 */
export const sortOutputByMessageIndex = (
  a: KernelOutput | ImmutableKernelOutput,
  b: KernelOutput | ImmutableKernelOutput
): number => a.messageIndex - b.messageIndex;

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
export const reduceImmutableNotebook = (notebook: ImmutableNotebook | null): ImmutableReducedNotebook | null =>
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
export const makeNotebookAccessLevelsImmutable = (
  users: NotebookAccessLevel[]
): ImmutableList<ImmutableNotebookAccessLevel> =>
  ImmutableList(users.map((user) => new ImmutableNotebookAccessLevelFactory(user)));

/**
 * Convert an array of access levels to an immutable list of immutable access levels
 */
export const makeWorkshopAccessLevelsImmutable = (
  users: WorkshopAccessLevel[]
): ImmutableList<ImmutableWorkshopAccessLevel> =>
  ImmutableList(users.map((user) => new ImmutableWorkshopAccessLevelFactory(user)));

/**
 * Given a DCell, make sure all values exist
 */
export const cleanDCell = (cell: DCell): Required<DCell> => {
  return {
    ...cell,
    cursor_col: cell.cursor_col ?? null,
    cursor_row: cell.cursor_row ?? null,
    lock_held_by: cell.lock_held_by ?? '',
  };
};

/**
 * Convert an array of cells to a dictionary
 */
export const cellArrayToImmutableMap = (cells: DCell[] | EditorCell[]): ReduxState['editor']['cells'] => {
  let map = ImmutableMap<EditorCell['cell_id'], ImmutableEditorCell>();

  map = map.withMutations((mtx) => {
    cells.forEach((cell) => {
      mtx.set(cell.cell_id, new ImmutableEditorCellFactory(cell));
    });
  });

  return map;
};

/**
 * Convert a decompressed output object into an array of kernel outputs
 */
export const convertOutputToReceivablePayload = (output: OOutput): ReceivableKernelOutputPayload => {
  const { metadata, messages } = JSON.parse(output.output) as SendableKernelOutputPayload;

  return {
    metadata: {
      ...metadata,
      uid: output.uid,
      nb_id: output.nb_id,
      cell_id: output.cell_id,
    },
    messages: messages.map((message) => ({
      ...message,
      uid: output.uid,
      cell_id: output.cell_id,
      runIndex: metadata.runIndex,
    })),
  };
};

/**
 * Convert an array of kernel outputs to an output object ready for compression
 */
export const convertSendablePayloadToOutputString = (payload: SendableKernelOutputPayload): string => {
  return JSON.stringify(payload);
};

/**
 * Convert arbitrary text to an array of DCells if possible, otherwise null
 */
export const convertTextToCells = (text: string): Pick<DCell, 'language' | 'contents'>[] | null => {
  try {
    const ipynb = JSON.parse(text) as IpynbNotebook;

    const cells: Pick<DCell, 'language' | 'contents'>[] = [];

    ipynb.cells
      .filter((cell) => cell.cell_type === 'code' || cell.cell_type === 'markdown')
      .forEach((cell) => {
        cells.push({
          language: cell.cell_type === 'code' ? 'python' : 'markdown',
          contents: Array.isArray(cell.source) ? cell.source.join('') : cell.source,
        });
      });

    return cells;
  } catch (error) {
    return null;
  }
};

/**
 * Given cells and outputs, convert the notebook to a JSON ipynb format
 */
const convertToIpynb = (
  notebookCells: {
    cell: ImmutableEditorCell;
    outputs?: ImmutableList<ImmutableKernelOutput>;
  }[]
): string => {
  const ipynb: IpynbNotebook = {
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
  };

  return JSON.stringify(ipynb);
};

/**
 * Given cells and outputs, convert the notebook to a python file
 */
const convertToPy = (
  notebookCells: {
    cell: ImmutableEditorCell;
    outputs?: ImmutableList<ImmutableKernelOutput>;
  }[]
): string => {
  return notebookCells
    .map(({ cell }) =>
      cell.language === 'python'
        ? cell.contents
        : cell.contents
            .split('\n')
            .map((line) => `# ${line}`)
            .join('\n')
    )
    .join('\n\n');
};

/**
 * Given cells and outputs, convert the notebook to a markdown file
 */
const convertToMd = (
  notebookCells: {
    cell: ImmutableEditorCell;
    outputs?: ImmutableList<ImmutableKernelOutput>;
  }[]
): string => {
  return notebookCells
    .map(({ cell }) => (cell.language === 'python' ? `\`\`\`python\n${cell.contents}\n\`\`\`` : cell.contents))
    .join('\n\n');
};

/**
 * Download the given notebook data to an ipynb file. Only include outputs with the given uid and latest run index
 */
export const download = (
  notebook: ImmutableReducedNotebook,
  cells: ReduxState['editor']['cells'],
  outputs: ReduxState['editor']['outputs'],
  outputsMetadata: ReduxState['editor']['outputsMetadata'],
  uid: DUser['uid'],
  extension: 'ipynb' | 'py' | 'md' = 'ipynb'
): void => {
  const notebookData: { cell: ImmutableEditorCell; outputs?: ImmutableList<ImmutableKernelOutput> }[] = [];

  notebook.cell_ids.forEach((cell_id) => {
    const cell = cells.get(cell_id);
    const cellOutputMetadata = outputsMetadata.get(cell_id)?.get(uid);
    const cellOutputs = outputs
      .get(cell_id)
      ?.get(uid)
      ?.get((uid === '' ? cell?.runIndex : cellOutputMetadata?.runIndex)?.toString() ?? '');

    if (cell) {
      notebookData.push({
        cell: uid === '' ? cell : cell.set('runIndex', cellOutputMetadata?.runIndex ?? -1),
        outputs: cellOutputs,
      });
    }
  });

  let content: string = '';

  switch (extension) {
    case 'ipynb': {
      content = convertToIpynb(notebookData);
      break;
    }
    case 'py': {
      content = convertToPy(notebookData);
      break;
    }
    case 'md': {
      content = convertToMd(notebookData);
      break;
    }
  }

  const blob = new Blob([content], {
    type: 'charset=utf-8',
  });

  saveAs(blob, `${notebook.name}.${extension}`);
};
