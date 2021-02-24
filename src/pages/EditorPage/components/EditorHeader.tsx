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
    paddingLeft: 263,
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
  const localKernelStatus = useKernelStatus();

  const cells = useSelector((state: ReduxState) => state.editor.cells);
  const connectToKernelErrorMessage = useSelector((state: ReduxState) => state.editor.connectToKernelErrorMessage);
  const isAddingCell = useSelector((state: ReduxState) => state.editor.isAddingCell);
  const isDeletingCell = useSelector((state: ReduxState) => state.editor.isDeletingCell);
  const isEditingCell = useSelector((state: ReduxState) => state.editor.isEditingCell);
  const isExecutingCode = useSelector((state: ReduxState) => state.editor.isExecutingCode);
  const lockedCellId = useSelector((state: ReduxState) => state.editor.lockedCellId);

  const [tempKernelSelection, setTempKernelSelection] = React.useState<string>('localhost');
  const [showDeleteCell, setShowDeleteCell] = React.useState<boolean>(false);

  const lockedCell = React.useMemo(() => cells.find((cell) => cell.cell_id === lockedCellId) ?? null, [
    cells,
    lockedCellId,
  ]);

  const kernelStatus = React.useMemo(() => (tempKernelSelection === 'localhost' ? localKernelStatus : 'Offline'), [
    localKernelStatus,
    tempKernelSelection,
  ]);

  const statusColor = React.useMemo(
    () =>
      kernelStatus === 'Error'
        ? palette.ERROR
        : kernelStatus === 'Busy'
        ? palette.WARNING
        : kernelStatus === 'Idle'
        ? palette.SUCCESS
        : palette.GRAY,
    [kernelStatus]
  );

  const statusTooltip = React.useMemo<StatusIndicatorProps['tooltipOptions']>(
    () => ({
      placement: 'bottomEnd',
      text: kernelStatus === 'Error' ? `Error: ${connectToKernelErrorMessage}` : kernelStatus,
    }),
    [connectToKernelErrorMessage, kernelStatus]
  );

  const isStable = React.useMemo(() => !(isAddingCell || isDeletingCell || isEditingCell || isExecutingCode), [
    isAddingCell,
    isDeletingCell,
    isEditingCell,
    isExecutingCode,
  ]);

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

  const handleLanguageSelect = React.useCallback(
    (eventKey: EditorCell['language']) => {
      dispatchEditCell(lockedCellId, {
        language: eventKey,
      });
    },
    [dispatchEditCell, lockedCellId]
  );

  const handleKernelSelect = React.useCallback((eventKey: string) => {
    setTempKernelSelection(eventKey);
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
            tooltipText="Run the next cell"
            tooltipDirection="bottom"
            loading={isExecutingCode}
            disabled={!isStable}
            onClick={() => console.log('TODO')}
          />
          <ColoredIconButton
            icon="stop"
            tooltipText="Interrupt the kernel"
            tooltipDirection="bottom"
            onClick={() => console.log('TODO')}
          />

          <Divider vertical />

          <ColoredIconButton
            icon="plus"
            tooltipText="Create a new cell"
            tooltipDirection="bottom"
            loading={isAddingCell}
            disabled={!isStable}
            onClick={() => dispatchAddCell(-1)}
          />
          <ColoredIconButton
            icon="trash2"
            tooltipText="Delete the current cell"
            tooltipDirection="bottom"
            loading={isDeletingCell}
            disabled={!isStable || lockedCellId === ''}
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
            activeKey={tempKernelSelection}
            buttonContent={
              <React.Fragment>
                {tempKernelSelection !== '' && (
                  <StatusIndicator textPlacement="right" color={statusColor} tooltipOptions={statusTooltip} />
                )}

                {tempKernelSelection}
              </React.Fragment>
            }
            onSelect={handleKernelSelect}
          >
            <Dropdown.Item eventKey="localhost">localhost</Dropdown.Item>
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
          <Button appearance="primary" onClick={dispatchDeleteCell}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Header>
  );
};

export default EditorHeader;
