import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Icon } from 'rsuite';

import { ReduxState } from '../types/redux';
import { _editor } from '../redux/actions';
import { EditorCell, ImmutableEditorCell } from '../types/notebook';
import { palette, spacing } from '../constants/theme';
import useKernelStatus from '../kernel/useKernelStatus';

import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';
import OutputCell from './OutputCell';
import ColoredIconButton from './ColoredIconButton';
import IconTextButton from './IconTextButton';

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

const NotebookCell: React.FC<{ cell: ImmutableEditorCell }> = ({ cell }) => {
  const { kernelIsConnected } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const lockedCells = useSelector((state: ReduxState) => state.editor.lockedCells);
  const lockingCellId = useSelector((state: ReduxState) => state.editor.lockingCellId);
  const unlockingCellId = useSelector((state: ReduxState) => state.editor.unlockingCellId);
  const selectedCellId = useSelector((state: ReduxState) => state.editor.selectedCellId);
  const runningCellId = useSelector((state: ReduxState) => state.editor.runningCellId);
  const runQueue = useSelector((state: ReduxState) => state.editor.runQueue);

  const cell_id = React.useMemo(() => cell.get('cell_id'), [cell]);
  const ownedCells = React.useMemo(() => lockedCells.filter((lock) => lock.get('uid') === user?.uid), [
    lockedCells,
    user?.uid,
  ]);
  const lockOwner = React.useMemo(
    () =>
      cell.get('lock_held_by') !== ''
        ? {
            uid: cell.get('lock_held_by'),
          }
        : null,
    [cell]
  );
  const ownsCell = React.useMemo(() => lockOwner?.uid === user?.uid, [lockOwner?.uid, user?.uid]);
  const lockedByOtherUser = React.useMemo(() => !ownsCell && lockOwner !== null, [lockOwner, ownsCell]);
  const canLock = React.useMemo(() => lockOwner === null, [lockOwner]);
  const isLocking = React.useMemo(() => lockingCellId === cell_id, [cell_id, lockingCellId]);
  const isUnlocking = React.useMemo(() => unlockingCellId === cell_id, [cell_id, unlockingCellId]);
  const isSelected = React.useMemo(() => selectedCellId === cell_id, [cell_id, selectedCellId]);
  const isRunning = React.useMemo(() => runningCellId === cell_id, [cell_id, runningCellId]);
  const queueIndex = React.useMemo(() => runQueue.findIndex((next_cell_id) => next_cell_id === cell_id), [
    cell_id,
    runQueue,
  ]);
  const isQueued = React.useMemo(() => queueIndex >= 0, [queueIndex]);

  const dispatch = useDispatch();
  const dispatchUnlockCell = React.useCallback(() => user !== null && dispatch(_editor.unlockCell(user, cell_id)), [
    cell_id,
    dispatch,
    user,
  ]);
  const dispatchEditCell = React.useCallback(
    (cell_id: EditorCell['cell_id'], changes: Partial<EditorCell>) => dispatch(_editor.editCell(cell_id, changes)),
    [dispatch]
  );
  const dispatchEditMarkdownCell = React.useCallback(
    () =>
      cell.get('language') === 'markdown' &&
      cell.get('rendered') &&
      dispatch(_editor.editCell(cell.get('cell_id'), { rendered: false })),
    [cell, dispatch]
  );

  const onFocusEditor = React.useCallback(
    (cell_id: string) => {
      if (canLock && user !== null) {
        ownedCells.forEach((ownedCell) => dispatch(_editor.unlockCell(user, ownedCell.get('cell_id'))));

        dispatch(_editor.lockCell(user, cell_id));
      }

      dispatch(_editor.selectCell(cell_id));
    },
    [canLock, dispatch, ownedCells, user]
  );

  const onClickLock = React.useCallback(() => onFocusEditor(cell_id), [cell_id, onFocusEditor]);

  const onClickPlay = React.useCallback(() => {
    if (cell.get('language') === 'python') {
      dispatch(_editor.addCellToQueue(cell));
    } else {
      dispatch(_editor.editCell(cell.get('cell_id'), { rendered: true }));
    }

    dispatch(_editor.selectCell(cell.get('cell_id')));
    dispatch(_editor.selectNextCell());
  }, [cell, dispatch]);

  const onChange = React.useCallback(
    (cell_id: string, newValue: string) => {
      dispatchEditCell(cell_id, {
        contents: newValue,
      });
    },
    [dispatchEditCell]
  );

  return (
    <div className={css(styles.container, ownsCell && styles.containerLocked, isSelected && styles.containerSelected)}>
      <div className={css(styles.controls)}>
        <div className={css(styles.runIndexContainer)}>
          {cell.get('language') !== 'markdown' && (
            <React.Fragment>
              <code>[</code>
              <code className={css(styles.runIndex)}>
                {isRunning || isQueued ? '*' : cell.get('runIndex') === -1 ? '' : cell.get('runIndex')}
              </code>
              <code>]</code>
            </React.Fragment>
          )}
        </div>
      </div>

      <div className={css(styles.content)}>
        {cell.get('language') === 'python' || !cell.get('rendered') ? (
          <div
            className={css(
              styles.codeContainer,
              lockedByOtherUser
                ? styles.codeContainerLockedByOtherUser
                : !ownsCell && (!canLock || ownedCells.size > 0)
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
              (!kernelIsConnected && cell.get('language') === 'python') ||
              (cell.get('language') === 'markdown' && cell.get('rendered'))
            }
            onClick={onClickPlay}
          />

          {ownsCell ? (
            <IconTextButton
              icon="unlock-alt"
              text={isUnlocking ? 'Unlocking...' : 'Unlock'}
              bgColor="transparent"
              tooltipText="Allow others to edit"
              tooltipDirection="bottom"
              color={palette.PRIMARY}
              disabled={isUnlocking}
              onClick={dispatchUnlockCell}
            />
          ) : lockOwner !== null ? (
            <div className={css(styles.lockOwnerContainer)}>
              <Icon icon="pencil" />
              <span className={css(styles.lockOwnerText)}>Bailey Tincher</span>
            </div>
          ) : (
            <IconTextButton
              icon="lock"
              text={isLocking ? 'Locking...' : 'Lock'}
              bgColor="transparent"
              tooltipText="Lock for editing"
              tooltipDirection="bottom"
              color={palette.GRAY}
              disabled={!canLock || isLocking}
              onClick={onClickLock}
            />
          )}
        </div>

        <OutputCell cell={cell} uid={user?.uid} />
      </div>
    </div>
  );
};

/**
 * Verify cell exists before creating cell
 */
const NotebookCellWrapper: React.FC<{ cell_id: EditorCell['cell_id'] }> = ({ cell_id }) => {
  const cells = useSelector((state: ReduxState) => state.editor.cells);

  const cell = React.useMemo(() => cells.get(cell_id) ?? null, [cell_id, cells]);

  if (cell !== null) {
    return <NotebookCell cell={cell} />;
  } else {
    return <React.Fragment />;
  }
};

export default NotebookCellWrapper;
