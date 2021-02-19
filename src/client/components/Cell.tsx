import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Icon } from 'rsuite';

import { ReduxState } from '../redux';
import { _editor } from '../redux/actions';
import { EditorCell } from '../types/notebook';
import { palette, spacing } from '../constants/theme';

import CodeCell from './CodeCell';
import OutputCell from './OutputCell';
import ColoredIconButton from './ColoredIconButton';
import IconTextButton from './IconTextButton';
import useKernelStatus from '../kernel/useKernelStatus';

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.DEFAULT,
    paddingRight: spacing.DEFAULT,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.BASE,
    borderLeftStyle: 'solid',
    borderLeftWidth: 3,
    borderLeftColor: palette.BASE,
    opacity: 1,
  },
  containerLocked: {
    borderLeftColor: palette.LIGHT_LAVENDER,
    backgroundColor: palette.BASE_FADED,
  },
  controls: {
    marginTop: -3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  runIndexContainer: {
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
    minWidth: 0, // Allow it to be smaller than the content
  },
  codeContainer: {
    pointerEvents: 'auto',
    opacity: 1,
  },
  codeContainerLockInUse: {
    opacity: 0.6,
  },
  codeContainerLockedByOtherUser: {
    pointerEvents: 'none',
    opacity: 0.6,
  },
  cellToolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  lockOwnerContainer: {
    paddingLeft: 8,
    color: palette.GRAY,
  },
  lockOwnerText: {
    marginLeft: 4,
    fontSize: 12,
  },
});

const Cell: React.FC<{ cell: EditorCell }> = ({ cell }) => {
  const kernelStatus = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const kernel = useSelector((state: ReduxState) => state.editor.kernel);
  const lockedCellId = useSelector((state: ReduxState) => state.editor.lockedCellId);
  const lockedCells = useSelector((state: ReduxState) => state.editor.lockedCells);
  const isLockingCell = useSelector((state: ReduxState) => state.editor.isLockingCell);
  const isUnlockingCell = useSelector((state: ReduxState) => state.editor.isUnlockingCell);
  const runningCellId = useSelector((state: ReduxState) => state.editor.runningCellId);

  const lock = React.useMemo(() => lockedCells.find((lockedCell) => lockedCell.cell_id === cell.cell_id) ?? null, [
    cell.cell_id,
    lockedCells,
  ]);
  const ownsLock = React.useMemo(() => lock?.uid === user?.uid, [lock?.uid, user?.uid]);
  const lockedByOtherUser = React.useMemo(() => !ownsLock && lock !== null, [lock, ownsLock]);
  const canLock = React.useMemo(() => lock === null && lockedCellId === '', [lock, lockedCellId]);

  const dispatch = useDispatch();
  const dispatchLockCell = React.useCallback(
    () => lockedCellId === '' && lock === null && dispatch(_editor.lockCell(cell.cell_id)),
    [cell.cell_id, dispatch, lock, lockedCellId]
  );
  const dispatchUnlockCell = React.useCallback(() => dispatch(_editor.unlockCell(cell.cell_id)), [
    cell.cell_id,
    dispatch,
  ]);
  const dispatchEditCell = React.useCallback(
    (cell_id: EditorCell['cell_id'], changes: Partial<EditorCell>) => dispatch(_editor.editCell(cell_id, changes)),
    [dispatch]
  );
  const dispatchExecuteCode = React.useCallback(
    () => kernel !== null && cell.language === 'py' && dispatch(_editor.executeCode(kernel, cell)),
    [cell, dispatch, kernel]
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
    <div className={css(styles.container, ownsLock && styles.containerLocked)}>
      <div className={css(styles.controls)}>
        <div className={css(styles.runIndexContainer)}>
          <code>[</code>
          <code className={css(styles.runIndex)}>{cell.runIndex === -1 ? '' : cell.runIndex}</code>
          <code>]</code>
        </div>
      </div>

      <div className={css(styles.content)}>
        <div
          className={css(
            styles.codeContainer,
            lockedByOtherUser
              ? styles.codeContainerLockedByOtherUser
              : !ownsLock && !canLock
              ? styles.codeContainerLockInUse
              : undefined
          )}
        >
          <CodeCell cell={cell} onFocus={dispatchLockCell} onChange={onChange} />
        </div>

        <div className={css(styles.cellToolbar)}>
          <ColoredIconButton
            icon="play"
            color={palette.SUCCESS}
            size="xs"
            loading={runningCellId === cell.cell_id}
            disabled={kernelStatus !== 'Idle'}
            onClick={dispatchExecuteCode}
          />

          {ownsLock ? (
            <IconTextButton
              icon="unlock-alt"
              text="Unlock"
              bgColor="transparent"
              tooltipText="Allow others to edit"
              tooltipDirection="bottom"
              color={palette.PRIMARY}
              loading={isUnlockingCell}
              onClick={dispatchUnlockCell}
            />
          ) : lock !== null ? (
            <div className={css(styles.lockOwnerContainer)}>
              <Icon icon="pencil" />
              <span className={css(styles.lockOwnerText)}>Bailey Tincher</span>
            </div>
          ) : (
            <IconTextButton
              icon="lock"
              text="Lock"
              bgColor="transparent"
              tooltipText="Lock for editing"
              tooltipDirection="bottom"
              color={palette.GRAY}
              loading={isLockingCell}
              disabled={!canLock}
              onClick={dispatchLockCell}
            />
          )}
        </div>

        <OutputCell cell={cell} uid={user?.uid} />
      </div>
    </div>
  );
};

export default Cell;
