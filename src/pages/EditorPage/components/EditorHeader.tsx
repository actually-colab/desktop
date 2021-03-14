import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Divider, Dropdown, Modal } from 'rsuite';

import { palette, spacing } from '../../../constants/theme';
import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';
import { EditorCell } from '../../../types/notebook';
import useKernelStatus from '../../../kernel/useKernelStatus';
import { ColoredIconButton, Header, PopoverDropdown, StatusIndicator, UserAvatar } from '../../../components';
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
  const connectToKernelErrorMessage = useSelector((state: ReduxState) => state.editor.connectToKernelErrorMessage);
  const isAddingCell = useSelector((state: ReduxState) => state.editor.isAddingCell);
  const isDeletingCell = useSelector((state: ReduxState) => state.editor.isDeletingCell);
  const selectedCellId = useSelector((state: ReduxState) => state.editor.selectedCellId);

  const [outputSelection, setOutputSelection] = React.useState<string>(gatewayUri);
  const [showDeleteCell, setShowDeleteCell] = React.useState<boolean>(false);

  const ownedCells = React.useMemo(() => lockedCells.filter((lock) => lock.get('uid') === user?.uid), [
    lockedCells,
    user?.uid,
  ]);
  const lockedCell = React.useMemo(
    () => (ownedCells.size > 0 ? cells.get(ownedCells.get(0)?.get('cell_id') ?? '') ?? null : null),
    [cells, ownedCells]
  );
  const lockedCellId = React.useMemo(() => lockedCell?.get('cell_id') ?? '', [lockedCell]);
  const selectedCell = React.useMemo(
    () =>
      cells.get(selectedCellId) ??
      (notebook &&
        (notebook.get('cell_ids').size > 0 ? cells.get(notebook.get('cell_ids').get(0) ?? '') ?? null : null)),
    [cells, notebook, selectedCellId]
  );

  const statusTooltip = React.useMemo<StatusIndicatorProps['tooltipOptions']>(
    () => ({
      placement: 'bottomEnd',
      text: kernelStatus === 'Error' ? `Error: ${connectToKernelErrorMessage}` : kernelStatus,
    }),
    [connectToKernelErrorMessage, kernelStatus]
  );

  const dispatch = useDispatch();
  const dispatchAddCell = React.useCallback((index: number) => dispatch(_editor.addCell(index)), [dispatch]);
  const dispatchDeleteCell = React.useCallback(() => dispatch(_editor.deleteCell(lockedCellId)), [
    dispatch,
    lockedCellId,
  ]);
  const dispatchEditCell = React.useCallback(
    (cell_id: EditorCell['cell_id'], changes: Partial<EditorCell>) => dispatch(_editor.editCell(cell_id, changes)),
    [dispatch]
  );
  const onClickPlayNext = React.useCallback(() => {
    if (selectedCell === null) {
      return;
    }

    if (selectedCell.get('language') === 'python') {
      dispatch(_editor.addCellToQueue(selectedCell));
    } else {
      dispatch(_editor.editCell(selectedCell.get('cell_id'), { rendered: true }));
    }

    dispatch(_editor.selectNextCell());
  }, [dispatch, selectedCell]);
  const dispatchStopCodeExecution = React.useCallback(
    () => lockedCellId !== '' && dispatch(_editor.stopCodeExecution(lockedCellId)),
    [dispatch, lockedCellId]
  );

  const handleLanguageSelect = React.useCallback(
    (eventKey: EditorCell['language']) => {
      dispatchEditCell(lockedCellId, {
        language: eventKey,
      });
    },
    [dispatchEditCell, lockedCellId]
  );

  const handleKernelSelect = React.useCallback((eventKey: string) => {
    setOutputSelection(eventKey);
  }, []);

  React.useEffect(() => {
    if (lockedCellId === '') {
      setShowDeleteCell(false);
    }
  }, [lockedCellId]);

  return (
    <Header>
      <div className={css(styles.header)}>
        <div className={css(styles.headerNoDrag)}>
          <ColoredIconButton
            size="sm"
            icon="step-forward"
            tooltipText="Run and advance"
            tooltipDirection="bottom"
            disabled={!kernelIsConnected && selectedCell?.get('language') !== 'markdown'}
            onClick={onClickPlayNext}
          />
          <ColoredIconButton
            size="sm"
            icon="stop"
            tooltipText="Interrupt the kernel"
            tooltipDirection="bottom"
            disabled={!kernelIsConnected}
            onClick={dispatchStopCodeExecution}
          />

          <Divider vertical />

          <ColoredIconButton
            size="sm"
            icon="plus"
            tooltipText="Create a new cell"
            tooltipDirection="bottom"
            loading={isAddingCell}
            onClick={() => dispatchAddCell(-1)}
          />
          <ColoredIconButton
            size="sm"
            icon="arrow-up2"
            tooltipText="Move the cell up"
            tooltipDirection="bottom"
            loading={false}
            disabled={true}
            onClick={() => console.log('TODO')}
          />
          <ColoredIconButton
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
            activeKey={lockedCell?.get('language') ?? 'python'}
            buttonProps={{ disabled: lockedCell === null }}
            buttonContent={
              (lockedCell?.get('language') === 'python' ? 'python3' : lockedCell?.get('language')) ?? 'python3'
            }
            onSelect={handleLanguageSelect}
          >
            <Dropdown.Item eventKey="python">python3</Dropdown.Item>
            <Dropdown.Item eventKey="markdown">markdown</Dropdown.Item>
          </PopoverDropdown>

          <Divider vertical />

          <ColoredIconButton
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
            <div className={css(styles.avatar)}>
              <UserAvatar
                placement="bottomEnd"
                user={{
                  uid: 'BAILEY', // TODO
                  name: 'Bailey Tincher',
                  email: 'bailey@test.com',
                }}
                statusColor={palette.SUCCESS}
              />
            </div>
          </div>

          <PopoverDropdown
            placement="bottomEnd"
            activeKey={outputSelection}
            buttonContent={
              <React.Fragment>
                {outputSelection === gatewayUri && (
                  <StatusIndicator textPlacement="right" color={kernelStatusColor} tooltipOptions={statusTooltip} />
                )}

                {outputSelection}
              </React.Fragment>
            }
            onSelect={handleKernelSelect}
          >
            <Dropdown.Item eventKey={gatewayUri}>{gatewayUri}</Dropdown.Item>
            <Dropdown.Item eventKey="bailey@test.com">bailey@test.com</Dropdown.Item>
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
