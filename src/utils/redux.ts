import { DCell } from '@actually-colab/editor-client';

import { ReduxState } from '../types/redux';

/**
 * Check if a cell is locked by the current user
 */
export const isCellOwner = (state: ReduxState, cell: DCell) => state.auth.user?.uid === cell.lock_held_by;
