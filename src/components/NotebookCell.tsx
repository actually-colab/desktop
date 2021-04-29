import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { DCell } from '@actually-colab/editor-types';

import { ReduxState } from '../types/redux';
import { _editor } from '../redux/actions';
import { EditorCell } from '../types/notebook';
import { ImmutableEditorCell } from '../immutable';
import { palette, spacing } from '../constants/theme';

import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';
import CellToolbar from './CellToolbar';
import OutputCell from './OutputCell';

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
    'overflow-anchor': 'none',
  },
  containerLocked: {
    borderLeftColor: palette.LIGHT_LAVENDER,
    backgroundColor: palette.BASE_FADED,
    'overflow-anchor': 'auto',
  },
  containerSelected: {
    borderLeftColor: palette.TANGERINE,
  },
  containerAnchored: {
    'overflow-anchor': 'auto',
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
    opacity: 0.7,
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
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const user = useSelector((state: ReduxState) => state.auth.user);
  const users = useSelector((state: ReduxState) => state.editor.notebook?.users);
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const ownedCellIds = useSelector(
    (state: ReduxState) =>
      state.editor.lockedCells
        .filter((lock) => lock.uid === user?.uid)
        .valueSeq()
        .map((lock) => lock.cell_id)
        .toArray(),
    shallowEqual
  );

  const isSelected = useSelector((state: ReduxState) => state.editor.selectedCellId === cell.cell_id, shallowEqual);
  const isRunning = useSelector((state: ReduxState) => state.editor.runningCellId === cell.cell_id, shallowEqual);
  const queueIndex = useSelector(
    (state: ReduxState) => state.editor.runQueue.findIndex((next_cell_id) => next_cell_id === cell.cell_id),
    shallowEqual
  );
  const outputsMetadata = useSelector((state: ReduxState) =>
    state.editor.outputsMetadata.get(cell.cell_id)?.get(selectedOutputsUid)
  );

  const accessLevel = React.useMemo(() => users?.find((_user) => _user.uid === user?.uid), [user?.uid, users]);
  const canEdit = React.useMemo(() => accessLevel?.access_level === 'Full Access', [accessLevel?.access_level]);
  const cell_id = React.useMemo(() => cell.cell_id, [cell.cell_id]);
  const lockOwner = React.useMemo(
    () =>
      cell.lock_held_by !== ''
        ? {
            uid: cell.lock_held_by,
            name: users?.find((_user) => _user.uid === cell.lock_held_by)?.name ?? 'Unknown',
          }
        : null,
    [cell.lock_held_by, users]
  );
  const ownsCell = React.useMemo(() => lockOwner?.uid === user?.uid, [lockOwner?.uid, user?.uid]);
  const ownsNoCells = React.useMemo(() => ownedCellIds.length === 0, [ownedCellIds]);
  const lockedByOtherUser = React.useMemo(() => !ownsCell && lockOwner !== null, [lockOwner, ownsCell]);
  const canLock = React.useMemo(() => lockOwner === null, [lockOwner]);
  const isQueued = React.useMemo(() => queueIndex >= 0, [queueIndex]);
  const runIndex = React.useMemo(() => (selectedOutputsUid === '' ? cell.runIndex : outputsMetadata?.runIndex ?? -1), [
    cell.runIndex,
    outputsMetadata,
    selectedOutputsUid,
  ]);

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
    (cell_id: EditorCell['cell_id']) => {
      if (!canEdit) return;

      if (canLock && user !== null) {
        ownedCellIds.forEach((cell_id) => dispatch(_editor.unlockCell(user, cell_id)));

        dispatch(_editor.lockCell(user, cell_id));
      }

      dispatch(_editor.selectCell(cell_id));
    },
    [canEdit, canLock, dispatch, ownedCellIds, user]
  );

  const onClickLock = React.useCallback(() => canEdit && onFocusEditor(cell_id), [canEdit, cell_id, onFocusEditor]);

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
    (cell_id: EditorCell['cell_id'], changes: Partial<DCell>) => {
      dispatchEditCell(cell_id, {
        changes,
      });
    },
    [dispatchEditCell]
  );

  /**
   * Auto scroll when cell is selected
   */
  React.useEffect(() => {
    if (isSelected) {
      containerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isSelected]);

  return (
    <div
      ref={containerRef}
      className={css(
        styles.container,
        ownsCell && styles.containerLocked,
        isSelected && styles.containerSelected,
        ownsNoCells && styles.containerAnchored
      )}
    >
      <div className={css(styles.controls)}>
        <div className={css(styles.runIndexContainer)}>
          {cell.language !== 'markdown' && (
            <React.Fragment>
              <code>[</code>
              <code className={css(styles.runIndex)}>
                {isRunning || isQueued ? '*' : runIndex === -1 ? '' : runIndex}
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
                : !ownsCell && (!canLock || !ownsNoCells)
                ? styles.codeContainerLockInUse
                : undefined
            )}
          >
            <CodeCell cell={cell} onFocus={onFocusEditor} onChange={onChange} />
          </div>
        ) : (
          <MarkdownCell cell={cell} onDoubleClick={dispatchEditMarkdownCell} />
        )}

        <CellToolbar
          cell={cell}
          lockOwner={lockOwner}
          ownsCell={ownsCell}
          isRunning={isRunning}
          canEdit={canEdit}
          canLock={canLock}
          onClickLock={onClickLock}
          onClickUnlock={dispatchUnlockCell}
          onClickPlay={onClickPlay}
        />

        <OutputCell cell={cell} />
      </div>
    </div>
  );
};

/**
 * Verify cell exists before creating cell
 */
const NotebookCellWrapper: React.FC<{ cell_id: EditorCell['cell_id'] }> = ({ cell_id }) => {
  const cell = useSelector((state: ReduxState) => state.editor.cells.get(cell_id));

  if (cell !== undefined) {
    return <NotebookCell cell={cell} />;
  } else {
    return <React.Fragment />;
  }
};

export default NotebookCellWrapper;
