import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Divider, Dropdown, Icon, Modal } from 'rsuite';
import { DUser } from '@actually-colab/editor-types';

import { palette, spacing } from '../../../constants/theme';
import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';
import { EditorCell } from '../../../types/notebook';
import useKernelStatus from '../../../kernel/useKernelStatus';
import { Header, PopoverDropdown, RegularIconButton, UserAvatar } from '../../../components';
import { CollaboratorsPopover } from '../Header';
import { ImmutableLock } from '../../../immutable';

const styles = StyleSheet.create({
  header: {
    paddingRight: spacing.DEFAULT / 2,
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
  avatarsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: spacing.DEFAULT / 2,
  },
  padLeft: {
    marginLeft: spacing.DEFAULT / 2,
  },
  kernelIconContainer: {
    position: 'relative',
    marginTop: 3,
    marginRight: spacing.DEFAULT / 2,
  },
});

/**
 * The header for the editor page
 */
const EditorHeader: React.FC = () => {
  const { kernelStatus, kernelStatusColor, kernelIsConnected } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const notebookUsers = useSelector((state: ReduxState) => state.editor.notebook?.users);
  const cell_ids = useSelector((state: ReduxState) => state.editor.notebook?.cell_ids);
  const lockedCellId = useSelector(
    (state: ReduxState) =>
      state.editor.lockedCells.filter((lock) => lock.uid === user?.uid).first<ImmutableLock | null>(null)?.cell_id ??
      '',
    shallowEqual
  );
  const users = useSelector((state: ReduxState) => state.editor.users);
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const isAddingCell = useSelector((state: ReduxState) => state.editor.isAddingCell);
  const isDeletingCell = useSelector((state: ReduxState) => state.editor.isDeletingCell);
  const selectedCellId = useSelector((state: ReduxState) => state.editor.selectedCellId);
  const lockedCellLanguage = useSelector(
    (state: ReduxState) => state.editor.cells.get(lockedCellId)?.language,
    shallowEqual
  );
  const selectedCellProperties = useSelector((state: ReduxState) => {
    const cell =
      state.editor.cells.get(selectedCellId) ??
      (cell_ids ? (cell_ids.size > 0 ? state.editor.cells.get(cell_ids.get(0) ?? '') ?? null : null) : null);

    if (!cell) {
      return cell;
    }

    return {
      language: cell?.language,
      rendered: cell?.rendered,
    };
  }, shallowEqual);

  const [showDeleteCell, setShowDeleteCell] = React.useState<boolean>(false);

  const accessLevel = React.useMemo(() => notebookUsers?.find((_user) => _user.uid === user?.uid), [
    notebookUsers,
    user?.uid,
  ]);
  const canEdit = React.useMemo(() => accessLevel?.access_level === 'Full Access', [accessLevel?.access_level]);

  const selectedOutputsEmail = React.useMemo<DUser['uid']>(
    () =>
      (selectedOutputsUid === ''
        ? user?.email
        : notebookUsers?.find((_user) => _user.uid === selectedOutputsUid)?.email) ?? '',
    [notebookUsers, selectedOutputsUid, user?.email]
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
    if (!selectedCellProperties) {
      return;
    }

    if (selectedCellProperties.language === 'python') {
      dispatch(_editor.addCellToQueue(selectedCellId));
    } else {
      if (!selectedCellProperties.rendered) {
        dispatch(
          _editor.editCell(selectedCellId, {
            metaChanges: {
              rendered: true,
            },
          })
        );
      }
    }

    dispatch(_editor.selectNextCell());
  }, [dispatch, selectedCellId, selectedCellProperties]);
  const dispatchStopCodeExecution = React.useCallback(
    () => lockedCellId !== '' && dispatch(_editor.stopCodeExecution(lockedCellId)),
    [dispatch, lockedCellId]
  );
  const dispatchSelectOutputUser = React.useCallback((uid: DUser['uid']) => dispatch(_editor.selectOutputUser(uid)), [
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
            disabled={
              (!kernelIsConnected || selectedOutputsUid !== '') && selectedCellProperties?.language === 'python'
            }
            onClick={onClickPlayNext}
          />
          <RegularIconButton
            size="sm"
            icon="stop"
            tooltipText="Interrupt the kernel"
            tooltipDirection="bottom"
            disabled={!kernelIsConnected || selectedOutputsUid !== ''}
            onClick={dispatchStopCodeExecution}
          />

          <Divider vertical />

          {canEdit ? (
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

              <Divider vertical />

              <RegularIconButton
                size="sm"
                icon="trash2"
                tooltipText="Delete the current cell"
                tooltipDirection="bottom"
                loading={isDeletingCell}
                disabled={!canEdit || lockedCellId === ''}
                onClick={() => setShowDeleteCell(true)}
              />
            </React.Fragment>
          ) : (
            'Read Only'
          )}
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
                <div className={css(styles.kernelIconContainer)}>
                  <Icon
                    icon="related-map"
                    size="lg"
                    style={selectedOutputsUid === '' ? { color: kernelStatusColor } : undefined}
                  />
                </div>
                {`Viewing: ${selectedOutputsUid === '' ? user?.email : selectedOutputsEmail}`}
              </React.Fragment>
            }
            onSelect={handleKernelSelect}
          >
            <Dropdown.Item eventKey="" disabled={kernelStatus === 'Busy'}>
              {`${user?.email} (you)`}
            </Dropdown.Item>

            {notebookUsers
              ?.filter((availableUser) => availableUser.uid !== user?.uid)
              .map((availableUser) => (
                <Dropdown.Item key={availableUser.uid} eventKey={availableUser.uid} disabled={kernelStatus === 'Busy'}>
                  {availableUser.email}
                </Dropdown.Item>
              ))}
          </PopoverDropdown>

          <div className={css(styles.padLeft)}>
            <CollaboratorsPopover />
          </div>
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
