import { Map as ImmutableMap } from 'immutable';
import { EditorCell, ImmutableEditorCell } from '../types/notebook';

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
};

export const IMMUTABLE_BASE_CELL: ImmutableEditorCell = (ImmutableMap(BASE_CELL) as unknown) as ImmutableEditorCell;
