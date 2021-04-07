import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Divider, Dropdown, Modal } from 'rsuite';
import { DUser } from '@actually-colab/editor-types';

import { palette, spacing } from '../../../constants/theme';
import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';
import { EditorCell } from '../../../types/notebook';
import useKernelStatus from '../../../kernel/useKernelStatus';
import { Header, PopoverDropdown, RegularIconButton, StatusIndicator, UserAvatar } from '../../../components';
import { StatusIndicatorProps } from '../../../components/StatusIndicator';

const styles = StyleSheet.create({
  header: {
    paddingRight: 4,
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerNoDrag: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarsContainer: {},
  avatar: {
    marginRight: spacing.DEFAULT / 2,
  },
});

/**
 * The header for the editor page
 */
const EditorHeader: React.FC = () => {
  const { kernelStatus, kernelStatusColor, kernelIsConnected } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);
  const notebook = useSelector((state: ReduxState) => state.editor.notebook);
  const lockedCells = useSelector((state: ReduxState) => state.editor.lockedCells);
  const cells = useSelector((state: ReduxState) => state.editor.cells);
  const users = useSelector((state: ReduxState) => state.editor.users);
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const connectToKernelErrorMessage = useSelector((state: ReduxState) => state.editor.connectToKernelErrorMessage);
  const isAddingCell = useSelector((state: ReduxState) => state.editor.isAddingCell);
  const isDeletingCell = useSelector((state: ReduxState) => state.editor.isDeletingCell);
  const selectedCellId = useSelector((state: ReduxState) => state.editor.selectedCellId);

  const [showDeleteCell, setShowDeleteCell] = React.useState<boolean>(false);

  const ownedCells = React.useMemo(() => lockedCells.filter((lock) => lock.uid === user?.uid), [
    lockedCells,
    user?.uid,
  ]);
  const lockedCell = React.useMemo(
    () => (ownedCells.size > 0 ? cells.get(ownedCells.get(0)?.cell_id ?? '') ?? null : null),
    [cells, ownedCells]
  );
  const lockedCellId = React.useMemo(() => lockedCell?.cell_id ?? '', [lockedCell?.cell_id]);
  const selectedCell = React.useMemo(
    () =>
      cells.get(selectedCellId) ??
      (notebook?.cell_ids
        ? notebook.cell_ids.size > 0
          ? cells.get(notebook.cell_ids.get(0) ?? '') ?? null
          : null
        : null),
    [cells, notebook?.cell_ids, selectedCellId]
  );

  const statusTooltip = React.useMemo<StatusIndicatorProps['tooltipOptions']>(
    () => ({
      placement: 'bottomEnd',
      text: kernelStatus === 'Error' ? `Error: ${connectToKernelErrorMessage}` : kernelStatus,
    }),
    [connectToKernelErrorMessage, kernelStatus]
  );
  const visibleSelectedOutputsUid = React.useMemo<DUser['uid']>(
    () => (selectedOutputsUid === '' ? user?.uid ?? '' : selectedOutputsUid),
    [selectedOutputsUid, user?.uid]
  );

  const dispatch = useDispatch();
  const dispatchAddCell = React.useCallback((index: number) => dispatch(_editor.addCell(index)), [dispatch]);
  const dispatchDeleteCell = React.useCallback(() => dispatch(_editor.deleteCell(lockedCellId)), [
    dispatch,
    lockedCellId,
  ]);
  const dispatchEditCell = React.useCallback(
    (cell_id: EditorCell['cell_id'], updates: _editor.EditCellUpdates) => dispatch(_editor.editCell(cell_id, updates)),
    [dispatch]
  );
  const onClickPlayNext = React.useCallback(() => {
    if (selectedCell === null) {
      return;
    }

    if (selectedCell.language === 'python') {
      dispatch(_editor.addCellToQueue(selectedCell));
    } else {
      if (!selectedCell.rendered) {
        dispatch(
          _editor.editCell(selectedCell.cell_id, {
            metaChanges: {
              rendered: true,
            },
          })
        );
      }
    }

    dispatch(_editor.selectNextCell());
  }, [dispatch, selectedCell]);
  const dispatchStopCodeExecution = React.useCallback(
    () => lockedCellId !== '' && dispatch(_editor.stopCodeExecution(lockedCellId)),
    [dispatch, lockedCellId]
  );
  const dispatchSelectOutputUser = React.useCallback((uid: string) => dispatch(_editor.selectOutputUser(uid)), [
    dispatch,
  ]);

  const handleLanguageSelect = React.useCallback(
    (eventKey: EditorCell['language']) => {
      dispatchEditCell(lockedCellId, {
        changes: {
          language: eventKey,
        },
      });
    },
    [dispatchEditCell, lockedCellId]
  );

  const handleKernelSelect = React.useCallback(
    (eventKey: string) => {
      dispatchSelectOutputUser(eventKey);
    },
    [dispatchSelectOutputUser]
  );

  React.useEffect(() => {
    if (lockedCellId === '') {
      setShowDeleteCell(false);
    }
  }, [lockedCellId]);

  return (
    <Header>
      <div className={css(styles.header)}>
        <div className={css(styles.headerNoDrag)}>
          <RegularIconButton
            size="sm"
            icon="step-forward"
            tooltipText="Run and advance"
            tooltipDirection="bottom"
            disabled={!kernelIsConnected && selectedCell?.language !== 'markdown'}
            onClick={onClickPlayNext}
          />
          <RegularIconButton
            size="sm"
            icon="stop"
            tooltipText="Interrupt the kernel"
            tooltipDirection="bottom"
            disabled={!kernelIsConnected}
            onClick={dispatchStopCodeExecution}
          />

          <Divider vertical />

          <RegularIconButton
            size="sm"
            icon="plus"
            tooltipText="Create a new cell"
            tooltipDirection="bottom"
            loading={isAddingCell}
            onClick={() => dispatchAddCell(-1)}
          />
          <RegularIconButton
            size="sm"
            icon="arrow-up2"
            tooltipText="Move the cell up"
            tooltipDirection="bottom"
            loading={false}
            disabled={true}
            onClick={() => console.log('TODO')}
          />
          <RegularIconButton
            size="sm"
            icon="arrow-down2"
            tooltipText="Move the cell down"
            tooltipDirection="bottom"
            loading={false}
            disabled={true}
            onClick={() => console.log('TODO')}
          />
          <PopoverDropdown
            placement="bottomEnd"
            activeKey={lockedCell?.language ?? 'python'}
            buttonProps={{ disabled: lockedCell === null }}
            buttonContent={(lockedCell?.language === 'python' ? 'python3' : lockedCell?.language) ?? 'python3'}
            onSelect={handleLanguageSelect}
          >
            <Dropdown.Item eventKey="python">python3</Dropdown.Item>
            <Dropdown.Item eventKey="markdown">markdown</Dropdown.Item>
          </PopoverDropdown>

          <Divider vertical />

          <RegularIconButton
            size="sm"
            icon="trash2"
            tooltipText="Delete the current cell"
            tooltipDirection="bottom"
            loading={isDeletingCell}
            disabled={lockedCellId === ''}
            onClick={() => setShowDeleteCell(true)}
          />
        </div>

        <div className={css(styles.headerNoDrag)}>
          <div className={css(styles.avatarsContainer)}>
            {users.map((activeUser) => (
              <div className={css(styles.avatar)} key={activeUser.uid}>
                <UserAvatar placement="bottomEnd" user={activeUser} statusColor={palette.SUCCESS} />
              </div>
            ))}
          </div>

          <PopoverDropdown
            placement="bottomEnd"
            activeKey={selectedOutputsUid}
            buttonContent={
              <React.Fragment>
                {selectedOutputsUid === '' && (
                  <StatusIndicator textPlacement="right" color={kernelStatusColor} tooltipOptions={statusTooltip} />
                )}

                {visibleSelectedOutputsUid}
              </React.Fragment>
            }
            onSelect={handleKernelSelect}
          >
            <Dropdown.Item eventKey="">{gatewayUri}</Dropdown.Item>

            {users.map((activeUser) => (
              <Dropdown.Item key={activeUser.uid} eventKey={activeUser.uid}>
                {activeUser.email}
              </Dropdown.Item>
            ))}
          </PopoverDropdown>
        </div>
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
    </Header>
  );
};

export default EditorHeader;
