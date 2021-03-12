import { DCell } from '@actually-colab/editor-client';

import { EXAMPLE_PROJECT } from '../constants/demo';
import { ReduxState } from '../types/redux';

/**
 * Check if the given redux state corresponds to using the demo project
 */
export const isDemo = (state: ReduxState) => state.editor.notebook.get('nb_id') === EXAMPLE_PROJECT.nb_id;

/**
 * Check if a cell is locked by the current user
 */
export const isCellOwner = (state: ReduxState, cell: DCell) => state.auth.user?.uid === cell.lock_held_by;
