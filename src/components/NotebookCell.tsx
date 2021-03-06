import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Icon } from 'rsuite';

import { ReduxState } from '../redux';
import { _editor } from '../redux/actions';
import { EditorCell } from '../types/notebook';
import { palette, spacing } from '../constants/theme';

import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';
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
  containerSelected: {
    borderLeftColor: palette.TANGERINE,
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
    opacity: 0.5,
  },
  codeContainerLockedByOtherUser: {
    opacity: 0.5,
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

const NotebookCell: React.FC<{ cell: EditorCell }> = ({ cell }) => {
  const { kernelIsConnected } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const lockedCellId = useSelector((state: ReduxState) => state.editor.lockedCellId);
  const lockedCells = useSelector((state: ReduxState) => state.editor.lockedCells);
  const isLockingCell = useSelector((state: ReduxState) => state.editor.isLockingCell);
  const isUnlockingCell = useSelector((state: ReduxState) => state.editor.isUnlockingCell);
  const selectedCellId = useSelector((state: ReduxState) => state.editor.selectedCellId);
  const runningCellId = useSelector((state: ReduxState) => state.editor.runningCellId);
  const runQueue = useSelector((state: ReduxState) => state.editor.runQueue);

  const lock = React.useMemo(() => lockedCells.find((lockedCell) => lockedCell.cell_id === cell.cell_id) ?? null, [
    cell.cell_id,
    lockedCells,
  ]);
  const ownsLock = React.useMemo(() => lock?.uid === user?.uid, [lock?.uid, user?.uid]);
  const lockedByOtherUser = React.useMemo(() => !ownsLock && lock !== null, [lock, ownsLock]);
  const canLock = React.useMemo(() => lock === null, [lock]);
  const isSelected = React.useMemo(() => selectedCellId === cell.cell_id, [cell.cell_id, selectedCellId]);
  const isRunning = React.useMemo(() => runningCellId === cell.cell_id, [cell.cell_id, runningCellId]);
  const isQueued = React.useMemo(() => runQueue.includes(cell.cell_id), [cell.cell_id, runQueue]);

  const dispatch = useDispatch();
  const dispatchUnlockCell = React.useCallback(
    () => user !== null && dispatch(_editor.unlockCell(user, cell.cell_id)),
    [cell.cell_id, dispatch, user]
  );
  const dispatchEditCell = React.useCallback(
    (cell_id: EditorCell['cell_id'], changes: Partial<EditorCell>) => dispatch(_editor.editCell(cell_id, changes)),
    [dispatch]
  );
  const dispatchEditMarkdownCell = React.useCallback(
    () => cell.language === 'md' && cell.rendered && dispatch(_editor.editCell(cell.cell_id, { rendered: false })),
    [cell.cell_id, cell.language, cell.rendered, dispatch]
  );

  const onFocusEditor = React.useCallback(() => {
    if (lock === null && user !== null) {
      if (lockedCellId !== '') {
        dispatch(_editor.unlockCell(user, lockedCellId));
      }

      dispatch(_editor.lockCell(user, cell.cell_id));
    }

    dispatch(_editor.selectCell(cell.cell_id));
  }, [cell.cell_id, dispatch, lock, lockedCellId, user]);

  const onClickPlay = React.useCallback(() => {
    if (cell.language === 'py') {
      dispatch(_editor.executeCodeQueue(cell.cell_id));
    } else {
      dispatch(_editor.editCell(cell.cell_id, { rendered: true }));
    }
  }, [cell, dispatch]);

  const onChange = React.useCallback(
    (_: string, newValue: string) => {
      dispatchEditCell(cell.cell_id, {
        code: newValue,
      });
    },
    [cell.cell_id, dispatchEditCell]
  );

  return (
    <div className={css(styles.container, ownsLock && styles.containerLocked, isSelected && styles.containerSelected)}>
      <div className={css(styles.controls)}>
        <div className={css(styles.runIndexContainer)}>
          {cell.language !== 'md' && (
            <React.Fragment>
              <code>[</code>
              <code className={css(styles.runIndex)}>
                {isRunning || isQueued ? '*' : cell.runIndex === -1 ? '' : cell.runIndex}
              </code>
              <code>]</code>
            </React.Fragment>
          )}
        </div>
      </div>

      <div className={css(styles.content)}>
        {cell.language === 'py' || !cell.rendered ? (
          <div
            className={css(
              styles.codeContainer,
              lockedByOtherUser
                ? styles.codeContainerLockedByOtherUser
                : !ownsLock && (!canLock || lockedCellId !== '')
                ? styles.codeContainerLockInUse
                : undefined
            )}
          >
            <CodeCell cell={cell} onFocus={onFocusEditor} onChange={onChange} />
          </div>
        ) : (
          <MarkdownCell cell={cell} onDoubleClick={dispatchEditMarkdownCell} />
        )}

        <div className={css(styles.cellToolbar)}>
          <ColoredIconButton
            icon="play"
            color={palette.SUCCESS}
            size="xs"
            loading={isRunning}
            disabled={
              (cell.language === 'py' && isQueued) || !kernelIsConnected || (cell.language === 'md' && cell.rendered)
            }
            onClick={onClickPlay}
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
              onClick={onFocusEditor}
            />
          )}
        </div>

        <OutputCell cell={cell} uid={user?.uid} />
      </div>
    </div>
  );
};

export default NotebookCell;
