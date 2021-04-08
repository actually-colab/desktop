import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Icon } from 'rsuite';

import { ReduxState } from '../types/redux';
import { _editor } from '../redux/actions';
import { EditorCell } from '../types/notebook';
import { ImmutableEditorCell } from '../immutable';
import { palette, spacing } from '../constants/theme';
import useKernelStatus from '../kernel/useKernelStatus';

import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';
import OutputCell from './OutputCell';
import ColoredIconButton from './ColoredIconButton';
import IconTextButton from './IconTextButton';
import Timer from './Timer';

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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cellToolbarStart: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  cellToolbarEnd: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
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

/**
 * A component to render all the content for a cell in a notebook including an editor, a toolbar, and cell outputs
 */
const NotebookCell: React.FC<{ cell: ImmutableEditorCell }> = ({ cell }) => {
  const { kernelIsConnected } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const users = useSelector((state: ReduxState) => state.editor.users);
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const lockedCells = useSelector((state: ReduxState) => state.editor.lockedCells);
  const lockingCellId = useSelector((state: ReduxState) => state.editor.lockingCellId);
  const unlockingCellId = useSelector((state: ReduxState) => state.editor.unlockingCellId);
  const selectedCellId = useSelector((state: ReduxState) => state.editor.selectedCellId);
  const runningCellId = useSelector((state: ReduxState) => state.editor.runningCellId);
  const runQueue = useSelector((state: ReduxState) => state.editor.runQueue);

  const cell_id = React.useMemo(() => cell.cell_id, [cell.cell_id]);
  const ownedCells = React.useMemo(() => lockedCells.filter((lock) => lock.uid === user?.uid), [
    lockedCells,
    user?.uid,
  ]);
  const lockOwner = React.useMemo(
    () =>
      cell.lock_held_by !== ''
        ? {
            uid: cell.lock_held_by,
            name: users.find((_user) => _user.uid === cell.lock_held_by)?.name ?? 'Unknown',
          }
        : null,
    [cell.lock_held_by, users]
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
  const selectedRunIndex = React.useMemo(
    () => (selectedOutputsUid === '' ? cell.runIndex : cell.selectedOutputsRunIndex),
    [cell.runIndex, cell.selectedOutputsRunIndex, selectedOutputsUid]
  );

  const dispatch = useDispatch();
  const dispatchUnlockCell = React.useCallback(() => user !== null && dispatch(_editor.unlockCell(user, cell_id)), [
    cell_id,
    dispatch,
    user,
  ]);
  const dispatchEditCell = React.useCallback(
    (cell_id: EditorCell['cell_id'], updates: _editor.EditCellUpdates) => dispatch(_editor.editCell(cell_id, updates)),
    [dispatch]
  );
  const dispatchEditMarkdownCell = React.useCallback(
    () =>
      cell.language === 'markdown' &&
      cell.rendered &&
      dispatch(
        _editor.editCell(cell.cell_id, {
          metaChanges: {
            rendered: false,
          },
        })
      ),
    [cell.cell_id, cell.language, cell.rendered, dispatch]
  );

  const onFocusEditor = React.useCallback(
    (cell_id: string) => {
      if (canLock && user !== null) {
        ownedCells.forEach((ownedCell) => dispatch(_editor.unlockCell(user, ownedCell.cell_id)));

        dispatch(_editor.lockCell(user, cell_id));
      }

      dispatch(_editor.selectCell(cell_id));
    },
    [canLock, dispatch, ownedCells, user]
  );

  const onClickLock = React.useCallback(() => onFocusEditor(cell_id), [cell_id, onFocusEditor]);

  const onClickPlay = React.useCallback(() => {
    if (cell.language === 'python') {
      dispatch(_editor.addCellToQueue(cell));
    } else {
      if (!cell.rendered) {
        dispatch(
          _editor.editCell(cell.cell_id, {
            metaChanges: {
              rendered: true,
            },
          })
        );
      }
    }

    dispatch(_editor.selectCell(cell.cell_id));
    dispatch(_editor.selectNextCell());
  }, [cell, dispatch]);

  const onChange = React.useCallback(
    (cell_id: string, newValue: string) => {
      dispatchEditCell(cell_id, {
        changes: {
          contents: newValue,
        },
      });
    },
    [dispatchEditCell]
  );

  return (
    <div className={css(styles.container, ownsCell && styles.containerLocked, isSelected && styles.containerSelected)}>
      <div className={css(styles.controls)}>
        <div className={css(styles.runIndexContainer)}>
          {cell.language !== 'markdown' && (
            <React.Fragment>
              <code>[</code>
              <code className={css(styles.runIndex)}>
                {isRunning || isQueued ? '*' : selectedRunIndex === -1 ? '' : selectedRunIndex}
              </code>
              <code>]</code>
            </React.Fragment>
          )}
        </div>
      </div>

      <div className={css(styles.content)}>
        {cell.language === 'python' || !cell.rendered ? (
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
          <div className={css(styles.cellToolbarStart)}>
            <ColoredIconButton
              icon="play"
              color={palette.SUCCESS}
              size="xs"
              loading={isRunning}
              disabled={
                ((!kernelIsConnected || selectedOutputsUid !== '') && cell.language === 'python') ||
                (cell.language === 'markdown' && cell.rendered)
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
                <span className={css(styles.lockOwnerText)}>{lockOwner.name}</span>
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

          <div className={css(styles.cellToolbarEnd)}>
            <Timer active={isRunning} alwaysRender={cell.runIndex !== -1} nonce={cell.runIndex} />
          </div>
        </div>

        <OutputCell cell={cell} />
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
