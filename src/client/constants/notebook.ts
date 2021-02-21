import { EditorCell } from '../types/notebook';

/**
 * An editor cell with default values to be overridden
 */
export const BASE_CELL: EditorCell = {
  cell_id: '',
  language: 'py',
  editing: false,
  runIndex: -1,
  code: '',
};
