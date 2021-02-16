import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import { ReduxState } from '../redux';
import { _editor } from '../redux/actions';
import { EditorCell } from '../types/notebook';
import { spacing } from '../constants/theme';

import CodeCell from './CodeCell';
import OutputCell from './OutputCell';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.DEFAULT * 2,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  controls: {
    marginTop: -3,
    width: 64,
    textAlign: 'center',
  },
  runIndex: {
    marginLeft: 4,
    marginRight: 4,
    width: 48,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
});

const Cell: React.FC<{ cell: EditorCell }> = ({ cell }) => {
  const user = useSelector((state: ReduxState) => state.auth.user);
  const lockedCellId = useSelector((state: ReduxState) => state.editor.lockedCellId);

  const hasLock = React.useMemo(() => lockedCellId === cell.cell_id, [cell.cell_id, lockedCellId]);
  const lockOwner = 'TODO';

  const dispatch = useDispatch();
  const dispatchLockCell = React.useCallback(() => dispatch(_editor.lockCell(cell.cell_id)), [cell.cell_id, dispatch]);
  const dispatchUnlockCell = React.useCallback(() => dispatch(_editor.unlockCell(cell.cell_id)), [
    cell.cell_id,
    dispatch,
  ]);
  const dispatchEditCell = React.useCallback(
    (cell_id: string, changes: Partial<EditorCell>) => dispatch(_editor.editCell(cell_id, changes)),
    [dispatch]
  );

  const onChange = React.useCallback(
    (_: string, newValue: string) => {
      dispatchEditCell(cell.cell_id, {
        code: newValue,
      });
    },
    [cell.cell_id, dispatchEditCell]
  );

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.controls)}>
        <span>[</span>
        <span className={css(styles.runIndex)}>{cell.runIndex === -1 ? '' : cell.runIndex}</span>
        <span>]</span>
      </div>

      <div className={css(styles.content)}>
        <CodeCell cell={cell} onFocus={dispatchLockCell} onBlur={dispatchUnlockCell} onChange={onChange} />
        <OutputCell cell={cell} uid={user?.uid} />
      </div>
    </div>
  );
};

export default Cell;
