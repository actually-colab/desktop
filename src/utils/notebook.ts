import { IpynbCell, IpynbNotebook, IpynbOutput } from '../types/ipynb';
import { EditorCell, KernelOutput } from '../types/notebook';

import { SPLIT_KEEP_NEWLINE } from './regex';

/**
 * A comparator for sorting kernel outputs by their message indices
 */
export const sortOutputByMessageIndex = (a: KernelOutput, b: KernelOutput) => a.messageIndex - b.messageIndex;

/**
 * Given a cells and output, convert the notebook to a JSON ipynb format
 */
export const convertToIpynb = (cells: EditorCell[], outputs: KernelOutput[]): IpynbNotebook => ({
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
  cells: cells.map<IpynbCell>((cell) =>
    cell.language === 'md'
      ? {
          cell_type: 'markdown',
          metadata: {},
          source: cell.code.split(SPLIT_KEEP_NEWLINE),
        }
      : {
          cell_type: 'code',
          execution_count: cell.runIndex !== -1 ? cell.runIndex : null,
          metadata: {
            tags: [],
          },
          outputs: outputs
            .filter((output) => output.cell_id === cell.cell_id && output.runIndex === cell.runIndex)
            .sort(sortOutputByMessageIndex)
            .map<IpynbOutput>((output) => output.output),
          source: cell.code.split(SPLIT_KEEP_NEWLINE),
        }
  ),
});
