import * as React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Dropdown, Icon, IconButton, Modal, Popover, Whisper } from 'rsuite';
import { WhisperInstance } from 'rsuite/lib/Whisper';

import { ReduxState } from '../../types/redux';
import { EditorCell } from '../../types/notebook';
import { _editor } from '../../redux/actions';
import { palette } from '../../constants/theme';
import { getUserColor } from '../../utils/color';
import ContainerContext from '../../contexts/ContainerContext';
import useKernelStatus from '../../kernel/useKernelStatus';
import ColoredIconButton from '../ColoredIconButton';
import IconTextButton from '../IconTextButton';
import Timer from '../Timer';

const styles = StyleSheet.create({
  cellToolbar: {
    position: 'relative',
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
  const { container } = React.useContext(ContainerContext);
  const menuRef = React.useRef<WhisperInstance | null>(null);

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
  const runIndex = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.runIndex ?? -1, shallowEqual);
  const isDeletingCell = useSelector((state: ReduxState) => state.editor.isDeletingCell);
  const isLocking = useSelector((state: ReduxState) => state.editor.lockingCellId === cell_id, shallowEqual);
  const isUnlocking = useSelector((state: ReduxState) => state.editor.unlockingCellId === cell_id, shallowEqual);
  const isRunning = useSelector((state: ReduxState) => state.editor.runningCellId === cell_id, shallowEqual);

  const [showDeleteCell, setShowDeleteCell] = React.useState<boolean>(false);

  const ownsCell = React.useMemo(() => lockOwner?.uid === uid, [lockOwner?.uid, uid]);
  const canLock = React.useMemo(() => lockOwner === null, [lockOwner]);
  const canEdit = React.useMemo(() => accessLevel?.access_level === 'Full Access', [accessLevel?.access_level]);
  const userColor = React.useMemo(() => (lockOwner?.uid ? getUserColor(lockOwner.uid) : palette.GRAY), [
    lockOwner?.uid,
  ]);

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
  const dispatchToggleRendered = React.useCallback(() => {
    dispatch(
      _editor.editCell(cell_id, {
        metaChanges: {
          rendered: !rendered,
        },
      })
    );
  }, [cell_id, dispatch, rendered]);
  const dispatchDeleteCell = React.useCallback(() => dispatch(_editor.deleteCell(cell_id)), [cell_id, dispatch]);

  return (
    <div className={css(styles.cellToolbar)}>
      <div className={css(styles.cellToolbarStart)}>
        <ColoredIconButton
          container={container}
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
            container={container}
            icon="unlock-alt"
            text={isUnlocking ? 'Unlocking...' : 'Unlock'}
            tooltipText="Allow others to edit"
            tooltipDirection="bottom"
            color={palette.PRIMARY}
            disabled={!canEdit || isUnlocking}
            onClick={onClickUnlock}
          />
        ) : lockOwner !== null ? (
          <div className={css(styles.lockOwnerContainer)} style={{ color: userColor }}>
            <Icon icon="pencil" />
            <span className={css(styles.lockOwnerText)}>{lockOwner.name}</span>
          </div>
        ) : (
          <IconTextButton
            container={container}
            icon="lock"
            text={isLocking ? 'Locking...' : 'Lock'}
            tooltipText="Lock for editing"
            tooltipDirection="bottom"
            color={palette.GRAY}
            disabled={!canEdit || !canLock || isLocking}
            onClick={onClickLock}
          />
        )}
      </div>

      <div className={css(styles.cellToolbarEnd)}>
        <Timer
          active={isRunning}
          hidden={selectedOutputsUid !== '' || language !== 'python'}
          alwaysRender={runIndex !== -1}
          nonce={runIndex}
        />

        <Whisper
          ref={menuRef}
          container={container}
          trigger="click"
          placement="autoVerticalEnd"
          speaker={
            <Popover full style={{ border: '1px solid #ddd' }}>
              <Dropdown.Menu>
                {language === 'markdown' ? (
                  <Dropdown.Item
                    eventKey="toggle-render"
                    onSelect={() => {
                      menuRef.current?.close();
                      dispatchToggleRendered();
                    }}
                  >
                    <Icon icon={rendered ? 'code' : 'eye'} />
                    <span>{rendered ? 'Show code' : 'Render markdown'}</span>
                  </Dropdown.Item>
                ) : (
                  <Dropdown.Item
                    eventKey="run-cell"
                    disabled={!kernelIsConnected || selectedOutputsUid !== '' || isRunning}
                    onSelect={() => {
                      menuRef.current?.close();
                      onClickPlay();
                    }}
                  >
                    <Icon icon="play" />
                    <span>
                      {selectedOutputsUid !== ''
                        ? 'Viewing another user'
                        : !kernelIsConnected
                        ? 'No kernel connected'
                        : isRunning
                        ? 'Running'
                        : 'Run cell'}
                    </span>
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  eventKey="delete"
                  disabled={isDeletingCell}
                  onSelect={() => {
                    menuRef.current?.close();
                    setShowDeleteCell(true);
                  }}
                >
                  <Icon icon="trash-o" style={{ color: palette.ERROR }} />
                  <span style={{ color: palette.ERROR }}>Delete</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Popover>
          }
        >
          <IconButton size="xs" appearance="subtle" icon={<Icon icon="ellipsis-h" />} />
        </Whisper>
      </div>

      <Modal size="xs" show={showDeleteCell} onHide={() => !isDeletingCell && setShowDeleteCell(false)}>
        <Modal.Header>
          <Modal.Title>Are you sure you want to delete the cell?</Modal.Title>
        </Modal.Header>
        <Modal.Body>You cannot undo this action</Modal.Body>
        <Modal.Footer>
          <Button appearance="subtle" disabled={isDeletingCell} onClick={() => setShowDeleteCell(false)}>
            Cancel
          </Button>
          <Button appearance="primary" loading={isDeletingCell} onClick={dispatchDeleteCell}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CellToolbar;
