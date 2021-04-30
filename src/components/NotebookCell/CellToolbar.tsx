import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Icon } from 'rsuite';

import { ReduxState } from '../../types/redux';
import { EditorCell } from '../../types/notebook';
import { _editor } from '../../redux/actions';
import { palette } from '../../constants/theme';
import useKernelStatus from '../../kernel/useKernelStatus';
import ColoredIconButton from '../ColoredIconButton';
import IconTextButton from '../IconTextButton';
import Timer from '../Timer';

const styles = StyleSheet.create({
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
 * The toolbar rendered under a code cell
 */
const CellToolbar: React.FC<{
  cell_id: EditorCell['cell_id'];
}> = ({ cell_id }) => {
  const { kernelIsConnected } = useKernelStatus();

  const uid = useSelector((state: ReduxState) => state.auth.user?.uid);
  const accessLevel = useSelector((state: ReduxState) =>
    state.editor.notebook?.users.find((_user) => _user.uid === uid)
  );
  const lockOwner = useSelector((state: ReduxState) => {
    const cell = state.editor.cells.get(cell_id);

    return cell?.lock_held_by
      ? {
          uid: cell.lock_held_by,
          name: state.editor.notebook?.users.find((_user) => _user.uid === cell.lock_held_by)?.name ?? 'Unknown',
        }
      : null;
  }, shallowEqual);
  const language = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.language);
  const rendered = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.rendered);
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const runIndex = useSelector(
    (state: ReduxState) =>
      (state.editor.selectedOutputsUid === ''
        ? state.editor.cells.get(cell_id)?.runIndex
        : state.editor.outputsMetadata.get(cell_id)?.get(state.editor.selectedOutputsUid)?.runIndex) ?? -1,
    shallowEqual
  );
  const isLocking = useSelector((state: ReduxState) => state.editor.lockingCellId === cell_id, shallowEqual);
  const isUnlocking = useSelector((state: ReduxState) => state.editor.unlockingCellId === cell_id, shallowEqual);
  const isRunning = useSelector((state: ReduxState) => state.editor.runningCellId === cell_id, shallowEqual);

  const ownsCell = React.useMemo(() => lockOwner?.uid === uid, [lockOwner?.uid, uid]);
  const canLock = React.useMemo(() => lockOwner === null, [lockOwner]);
  const canEdit = React.useMemo(() => accessLevel?.access_level === 'Full Access', [accessLevel?.access_level]);

  const dispatch = useDispatch();

  const onClickLock = React.useCallback(() => {
    if (!canEdit) return;

    if (canLock) {
      dispatch(_editor.lockCell(cell_id));
    }

    dispatch(_editor.selectCell(cell_id));
  }, [canEdit, canLock, cell_id, dispatch]);
  const onClickUnlock = React.useCallback(() => dispatch(_editor.unlockCell(cell_id)), [cell_id, dispatch]);
  const onClickPlay = React.useCallback(() => {
    if (language === 'python') {
      dispatch(_editor.addCellToQueue(cell_id));
    } else {
      if (!rendered) {
        dispatch(
          _editor.editCell(cell_id, {
            metaChanges: {
              rendered: true,
            },
          })
        );
      }
    }

    dispatch(_editor.selectCell(cell_id));
    dispatch(_editor.selectNextCell());
  }, [cell_id, dispatch, language, rendered]);

  return (
    <div className={css(styles.cellToolbar)}>
      <div className={css(styles.cellToolbarStart)}>
        <ColoredIconButton
          icon="play"
          color={palette.SUCCESS}
          size="xs"
          loading={isRunning}
          disabled={
            ((!kernelIsConnected || selectedOutputsUid !== '') && language === 'python') ||
            (language === 'markdown' && rendered)
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
            disabled={!canEdit || isUnlocking}
            onClick={onClickUnlock}
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
            disabled={!canEdit || !canLock || isLocking}
            onClick={onClickLock}
          />
        )}
      </div>

      <div className={css(styles.cellToolbarEnd)}>
        <Timer active={isRunning} alwaysRender={runIndex !== -1} nonce={runIndex} />
      </div>
    </div>
  );
};

export default CellToolbar;
