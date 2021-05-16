import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Dropdown, Icon } from 'rsuite';
import { DUser } from '@actually-colab/editor-types';

import { spacing } from '../../../../constants/theme';
import { ReduxState } from '../../../../types/redux';
import { _editor } from '../../../../redux/actions';
import useKernelStatus from '../../../../kernel/useKernelStatus';
import { PopoverDropdown } from '../../../../components';

const styles = StyleSheet.create({
  kernelIconContainer: {
    position: 'relative',
    marginTop: 3,
    marginRight: spacing.DEFAULT / 2,
  },
});

/**
 * Component allowing user to select which users' kernel to view outputs from
 */
const KernelSelector: React.FC = () => {
  const { kernelStatus, kernelStatusColor } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const notebookUsers = useSelector((state: ReduxState) => state.editor.notebook?.users);
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
  );
};

export default KernelSelector;
