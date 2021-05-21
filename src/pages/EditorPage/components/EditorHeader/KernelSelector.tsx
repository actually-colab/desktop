import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Dropdown, HelpBlock, Icon } from 'rsuite';
import { DUser } from '@actually-colab/editor-types';

import { palette, spacing } from '../../../../constants/theme';
import { ReduxState } from '../../../../types/redux';
import { _editor } from '../../../../redux/actions';
import { sortUsersByName } from '../../../../utils/notebook';
import useKernelStatus from '../../../../kernel/useKernelStatus';
import { PopoverDropdown, StatusIndicator } from '../../../../components';
import { ImmutableNotebookAccessLevel, ImmutableUser } from '../../../../immutable';

const styles = StyleSheet.create({
  kernelIconContainer: {
    position: 'relative',
    marginRight: spacing.DEFAULT / 2,
  },
  helperContent: {
    ...spacing.pad({
      top: spacing.DEFAULT / 2,
    }),
    maxWidth: 318,
  },
  kernelContent: {
    paddingLeft: spacing.DEFAULT / 2,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  kernelIcon: {
    width: 16,
  },
  kernelTextContainer: {
    marginLeft: spacing.DEFAULT,
    display: 'flex',
    flexDirection: 'column',
  },
  kernelTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  kernelSubtitle: {
    fontSize: 11,
    fontWeight: 'normal',
    display: 'flex',
    flexDirection: 'row',
  },
});

/**
 * Component allowing user to select which users' kernel to view outputs from
 */
const KernelSelector: React.FC = () => {
  const { kernelStatus, kernelStatusColor } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const users = useSelector((state: ReduxState) => state.editor.users);
  const notebookUsers = useSelector((state: ReduxState) => state.editor.notebook?.users);
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);

  const activeUsers = React.useMemo(() => users.filter((_user) => _user.uid !== user?.uid).sort(sortUsersByName), [
    user?.uid,
    users,
  ]);
  const inactiveUsers = React.useMemo(
    () =>
      notebookUsers
        ?.filter(
          (_user) => _user.uid !== user?.uid && users.findIndex((activeUser) => activeUser.uid === _user.uid) === -1
        )
        .sort(sortUsersByName),
    [notebookUsers, user?.uid, users]
  );

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

  const renderUser = React.useCallback(
    (active: boolean) => (_user: ImmutableUser | ImmutableNotebookAccessLevel) => (
      <Dropdown.Item key={_user.uid} eventKey={_user.uid} disabled={kernelStatus === 'Busy'}>
        <div className={css(styles.kernelContent)}>
          <Icon
            className={css(styles.kernelIcon)}
            icon={selectedOutputsUid === _user.uid ? 'user' : 'user-o'}
            size="lg"
          />

          <div className={css(styles.kernelTextContainer)}>
            <span className={css(styles.kernelTitle)}>{_user.email}</span>
            <span className={css(styles.kernelSubtitle)}>
              <StatusIndicator color={active ? palette.SUCCESS : palette.GRAY} textPlacement="right" /> View Only
            </span>
          </div>
        </div>
      </Dropdown.Item>
    ),
    [kernelStatus, selectedOutputsUid]
  );

  return (
    <PopoverDropdown
      placement="bottomEnd"
      activeKey={selectedOutputsUid}
      appearance={selectedOutputsUid === '' ? 'default' : 'ghost'}
      size="sm"
      buttonContent={
        <React.Fragment>
          <div className={css(styles.kernelIconContainer)}>
            {selectedOutputsUid === '' ? <StatusIndicator color={kernelStatusColor} /> : <Icon icon="eye" />}
          </div>

          {selectedOutputsUid === '' ? 'Configured Kernel' : selectedOutputsEmail}
        </React.Fragment>
      }
      onSelect={handleKernelSelect}
    >
      <div className={css(styles.helperContent)}>
        <h6>Connect to a collaborator</h6>
        <HelpBlock>
          You can view the outputs from any active collaborator. You can only run cells when your configured kernel is
          selected.
        </HelpBlock>
      </div>

      <Dropdown.Item eventKey="" disabled={kernelStatus === 'Busy'}>
        <div className={css(styles.kernelContent)}>
          <Icon className={css(styles.kernelIcon)} icon="related-map" size="lg" />

          <div className={css(styles.kernelTextContainer)}>
            <span className={css(styles.kernelTitle)}>Configured Kernel</span>
            <span className={css(styles.kernelSubtitle)}>
              <StatusIndicator color={kernelStatusColor} textPlacement="right" />
              {kernelStatus !== 'Offline' ? gatewayUri : 'Not Connected'}
            </span>
          </div>
        </div>
      </Dropdown.Item>

      {activeUsers.map(renderUser(true))}
      {inactiveUsers?.map(renderUser(false))}
    </PopoverDropdown>
  );
};

export default KernelSelector;
