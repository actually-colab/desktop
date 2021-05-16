import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Dropdown, Icon } from 'rsuite';
import { DUser } from '@actually-colab/editor-types';

import { spacing } from '../../../../constants/theme';
import { ReduxState } from '../../../../types/redux';
import { _editor } from '../../../../redux/actions';
import useKernelStatus from '../../../../kernel/useKernelStatus';
import { Header, PopoverDropdown, UserAvatar } from '../../../../components';
import CollaboratorsPopover from './CollaboratorsPopover';
import ActionButtons from './ActionButtons';

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
  const { kernelStatus, kernelStatusColor } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const notebookUsers = useSelector((state: ReduxState) => state.editor.notebook?.users);
  const users = useSelector((state: ReduxState) => state.editor.users);
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);

  const selectedOutputsEmail = React.useMemo<DUser['uid']>(
    () =>
      (selectedOutputsUid === ''
        ? user?.email
        : notebookUsers?.find((_user) => _user.uid === selectedOutputsUid)?.email) ?? '',
    [notebookUsers, selectedOutputsUid, user?.email]
  );

  const dispatch = useDispatch();
  const dispatchSelectOutputUser = React.useCallback((uid: DUser['uid']) => dispatch(_editor.selectOutputUser(uid)), [
    dispatch,
  ]);

  const handleKernelSelect = React.useCallback(
    (eventKey: string) => {
      dispatchSelectOutputUser(eventKey);
    },
    [dispatchSelectOutputUser]
  );

  return (
    <Header>
      <div className={css(styles.header)}>
        <ActionButtons />

        <div className={css(styles.headerNoDrag)}>
          <div className={css(styles.avatarsContainer)}>
            {users.map((activeUser) => (
              <div className={css(styles.avatar)} key={activeUser.uid}>
                <UserAvatar placement="bottomEnd" user={activeUser} />
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
    </Header>
  );
};

export default EditorHeader;
