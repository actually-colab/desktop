import { IpynbCell, IpynbDisplayData, IpynbExecuteResult, IpynbNotebook, IpynbOutput } from '../types/ipynb';
import { EditorCell, KernelOutput } from '../types/notebook';

import { filterUndefined } from './filter';
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
            .map<IpynbOutput>((output) =>
              output.channel === 'stdout'
                ? {
                    output_type: 'stream',
                    name: 'stdout',
                    text: output.data.text.split(SPLIT_KEEP_NEWLINE),
                  }
                : output.channel === 'display_data'
                ? {
                    output_type: 'display_data',
                    data: filterUndefined({
                      'text/plain': output.data.text?.split(SPLIT_KEEP_NEWLINE),
                      'image/png': output.data.image,
                    }) as IpynbDisplayData['data'],
                    metadata: {
                      needs_background: 'light',
                    },
                  }
                : output.channel === 'html'
                ? {
                    output_type: 'execute_result',
                    execution_count: output.runIndex,
                    data: filterUndefined({
                      'text/plain': output.data.text?.split(SPLIT_KEEP_NEWLINE),
                      'text/html': output.data.html,
                    }) as IpynbExecuteResult['data'],
                    metadata: {},
                  }
                : {
                    output_type: 'error',
                    ename: output.data.ename,
                    evalue: output.data.evalue,
                    traceback: output.data.traceback,
                  }
            ),
          source: cell.code.split(SPLIT_KEEP_NEWLINE),
        }
  ),
});
