import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import { ReduxState } from '../redux';
import { _editor } from '../redux/actions';
import { EditorCell } from '../types/notebook';
import { spacing } from '../constants/theme';

import CodeCell from './CodeCell';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.DEFAULT * 2,
  },
});

const Cell: React.FC<{ cell: EditorCell }> = ({ cell }) => {
  const lockedCellId = useSelector((state: ReduxState) => state.editor.lockedCellId);

  const dispatch = useDispatch();
  const dispatchEditCell = React.useCallback(
    (cellId: string, changes: Partial<EditorCell>) => dispatch(_editor.editCell(cellId, changes)),
    [dispatch]
  );

  const onFocus = React.useCallback(() => {
    // TODO: require lock
    dispatchEditCell(cell.cell_id, {
      active: true,
    });
  }, [cell.cell_id, dispatchEditCell]);

  const onBlur = React.useCallback(() => {
    // TODO: unlock
    dispatchEditCell(cell.cell_id, {
      active: false,
    });
  }, [cell.cell_id, dispatchEditCell]);

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
      <CodeCell cell={cell} onFocus={onFocus} onBlur={onBlur} onChange={onChange} />
    </div>
  );
};

export default Cell;
