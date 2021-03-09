import { Map as ImmutableMap } from 'immutable';
import { EditorCell, ImmutableEditorCell } from '../types/notebook';

/**
 * An editor cell with default values to be overridden
 */
export const BASE_CELL: EditorCell = {
  cell_id: '',
  language: 'py',
  rendered: false,
  runIndex: -1,
  code: '',
};

export const IMMUTABLE_BASE_CELL: ImmutableEditorCell = (ImmutableMap(BASE_CELL) as unknown) as ImmutableEditorCell;
