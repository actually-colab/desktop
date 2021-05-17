import * as React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Button, Divider, Dropdown, Modal } from 'rsuite';

import { EditorCell } from '../../../../../types/notebook';
import { ReduxState } from '../../../../../types/redux';
import { _editor } from '../../../../../redux/actions';
import { PopoverDropdown, RegularIconButton } from '../../../../../components';
import { palette } from '../../../../../constants/theme';

const CellButtons: React.FC = () => {
  const user = useSelector((state: ReduxState) => state.auth.user);
  const notebookUsers = useSelector((state: ReduxState) => state.editor.notebook?.users);
  const lockedCellId = useSelector(
    (state: ReduxState) => state.editor.lockedCells.find((lock) => lock.uid === user?.uid)?.cell_id ?? '',
    shallowEqual
  );
  const isAddingCell = useSelector((state: ReduxState) => state.editor.isAddingCell);
  const isDeletingCell = useSelector((state: ReduxState) => state.editor.isDeletingCell);
  const lockedCellLanguage = useSelector(
    (state: ReduxState) => state.editor.cells.get(lockedCellId)?.language,
    shallowEqual
  );

  const [showDeleteCell, setShowDeleteCell] = React.useState<boolean>(false);

  const accessLevel = React.useMemo(() => notebookUsers?.find((_user) => _user.uid === user?.uid), [
    notebookUsers,
    user?.uid,
  ]);
  const canEdit = React.useMemo(() => accessLevel?.access_level === 'Full Access', [accessLevel?.access_level]);

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
  const handleLanguageSelect = React.useCallback(
    (eventKey: EditorCell['language']) => {
      dispatchEditCell(lockedCellId, {
        changes: {
          language: eventKey,
        },
        metaChanges:
          eventKey === 'markdown'
            ? {
                rendered: false,
              }
            : undefined,
      });
    },
    [dispatchEditCell, lockedCellId]
  );

  /**
   * Reset modal if cell unlocks
   */
  React.useEffect(() => {
    if (lockedCellId === '') {
      setShowDeleteCell(false);
    }
  }, [lockedCellId]);

  if (!canEdit) {
    return <span>Read Only</span>;
  }

  return (
    <React.Fragment>
      <RegularIconButton
        size="sm"
        icon="plus"
        tooltipText="Create a new cell"
        tooltipDirection="bottom"
        loading={isAddingCell}
        disabled={!canEdit}
        onClick={() => dispatchAddCell(-1)}
      />
      <RegularIconButton
        size="sm"
        icon="arrow-up2"
        tooltipText="Move the cell up (coming soon)"
        tooltipDirection="bottom"
        loading={false}
        disabled={true}
        onClick={() => console.log('TODO')}
      />
      <RegularIconButton
        size="sm"
        icon="arrow-down2"
        tooltipText="Move the cell down (coming soon)"
        tooltipDirection="bottom"
        loading={false}
        disabled={true}
        onClick={() => console.log('TODO')}
      />
      <RegularIconButton
        size="sm"
        icon="trash2"
        iconStyle={{
          enabled: {
            color: palette.ERROR,
          },
          disabled: {
            color: `${palette.ERROR}50`,
          },
        }}
        tooltipText="Delete the current cell"
        tooltipDirection="bottom"
        loading={isDeletingCell}
        disabled={!canEdit || lockedCellId === ''}
        onClick={() => setShowDeleteCell(true)}
      />

      <Divider vertical />

      <PopoverDropdown
        placement="bottomEnd"
        activeKey={lockedCellLanguage ?? 'python'}
        buttonProps={{ disabled: !canEdit || !lockedCellLanguage }}
        buttonContent={(lockedCellLanguage === 'python' ? 'python3' : lockedCellLanguage) ?? 'python3'}
        onSelect={handleLanguageSelect}
      >
        <Dropdown.Item eventKey="python">python3</Dropdown.Item>
        <Dropdown.Item eventKey="markdown">markdown</Dropdown.Item>
      </PopoverDropdown>

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
    </React.Fragment>
  );
};

export default CellButtons;
