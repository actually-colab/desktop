import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Divider, Dropdown, Modal } from 'rsuite';

import { palette, spacing } from '../../../constants/theme';
import { ReduxState } from '../../../redux';
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
  const { kernel, kernelStatus, kernelStatusColor, kernelIsConnected } = useKernelStatus();

  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);
  const cells = useSelector((state: ReduxState) => state.editor.cells);
  const connectToKernelErrorMessage = useSelector((state: ReduxState) => state.editor.connectToKernelErrorMessage);
  const isAddingCell = useSelector((state: ReduxState) => state.editor.isAddingCell);
  const isDeletingCell = useSelector((state: ReduxState) => state.editor.isDeletingCell);
  const lockedCellId = useSelector((state: ReduxState) => state.editor.lockedCellId);
  const selectedCellId = useSelector((state: ReduxState) => state.editor.selectedCellId);

  const [outputSelection, setOutputSelection] = React.useState<string>(gatewayUri);
  const [showDeleteCell, setShowDeleteCell] = React.useState<boolean>(false);

  const lockedCell = React.useMemo(() => cells.find((cell) => cell.cell_id === lockedCellId) ?? null, [
    cells,
    lockedCellId,
  ]);
  const selectedCell = React.useMemo(
    () => cells.find((cell) => cell.cell_id === selectedCellId) ?? (cells.length > 0 ? cells[0] : null),
    [cells, selectedCellId]
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

    if (selectedCell.language === 'py') {
      dispatch(_editor.executeCodeQueue(selectedCell.cell_id));
    } else {
      dispatch(_editor.editCell(selectedCell.cell_id, { rendered: true }));
    }

    dispatch(_editor.selectNextCell());
  }, [dispatch, selectedCell]);
  const dispatchStopCodeExecution = React.useCallback(
    () => lockedCell !== null && kernel !== null && dispatch(_editor.stopCodeExecution(gatewayUri, kernel, lockedCell)),
    [dispatch, gatewayUri, kernel, lockedCell]
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
            icon="step-forward"
            tooltipText="Run and advance"
            tooltipDirection="bottom"
            disabled={!kernelIsConnected && selectedCell?.language !== 'md'}
            onClick={onClickPlayNext}
          />
          <ColoredIconButton
            icon="stop"
            tooltipText="Interrupt the kernel"
            tooltipDirection="bottom"
            disabled={!kernelIsConnected}
            onClick={dispatchStopCodeExecution}
          />

          <Divider vertical />

          <ColoredIconButton
            icon="plus"
            tooltipText="Create a new cell"
            tooltipDirection="bottom"
            loading={isAddingCell}
            onClick={() => dispatchAddCell(-1)}
          />
          <ColoredIconButton
            icon="trash2"
            tooltipText="Delete the current cell"
            tooltipDirection="bottom"
            loading={isDeletingCell}
            disabled={lockedCellId === ''}
            onClick={() => setShowDeleteCell(true)}
          />

          <Divider vertical />

          <PopoverDropdown
            placement="bottomEnd"
            activeKey={lockedCell?.language ?? 'py'}
            buttonProps={{ disabled: lockedCell === null }}
            buttonContent={lockedCell?.language ?? 'py'}
            onSelect={handleLanguageSelect}
          >
            <Dropdown.Item eventKey="py">python</Dropdown.Item>
            <Dropdown.Item eventKey="md">markdown</Dropdown.Item>
          </PopoverDropdown>
        </div>

        <div className={css(styles.headerNoDrag)}>
          <div className={css(styles.avatarsContainer)}>
            <div className={css(styles.avatar)}>
              <UserAvatar
                placement="bottomEnd"
                user={{
                  uid: 1, // TODO
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

      <Modal size="xs" show={showDeleteCell} onHide={() => setShowDeleteCell(false)}>
        <Modal.Header>
          <Modal.Title>Are you sure you want to delete the cell?</Modal.Title>
        </Modal.Header>
        <Modal.Body>You cannot undo this action</Modal.Body>
        <Modal.Footer>
          <Button appearance="subtle" onClick={() => setShowDeleteCell(false)}>
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
