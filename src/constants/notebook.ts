import { EditorCell } from '../types/notebook';
import { makeImmutableEditorCell } from '../utils/immutable/notebook';

/**
 * An editor cell with default values to be overridden
 */
export const BASE_CELL: EditorCell = {
  nb_id: '',
  cell_id: '',
  time_modified: -1,
  lock_held_by: '',
  language: 'python3',
  rendered: false,
  runIndex: -1,
  contents: '',
} as const;

export const IMMUTABLE_BASE_CELL = makeImmutableEditorCell(BASE_CELL);
