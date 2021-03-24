import { EditorCell } from '../types/notebook';
import { makeImmutableEditorCell } from '../utils/immutable/notebook';

/**
 * An editor cell with default values to be overridden
 */
export const BASE_CELL: EditorCell = {
  nb_id: '',
  cell_id: '',
  position: -1,
  time_modified: -1,
  lock_held_by: '',
  cursor_pos: null,
  language: 'python',
  rendered: true,
  runIndex: -1,
  contents: '',
} as const;

export const IMMUTABLE_BASE_CELL = makeImmutableEditorCell(BASE_CELL);
