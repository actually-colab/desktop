import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon, IconButton } from 'rsuite';

import { ReduxState } from '../../../../types/redux';
import { _auth } from '../../../../redux/actions';
import { palette, spacing } from '../../../../constants/theme';
import { UserAvatar } from '../../../../components';

const styles = StyleSheet.create({
  profileButtonContainer: {
    marginLeft: spacing.DEFAULT,
  },
  profilePopoverTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePopoverContent: {
    display: 'flex',
    flexDirection: 'column',
  },
});

/**
 * The user profile button and popover
 */
const ProfileButton: React.FC = () => {
  const user = useSelector((state: ReduxState) => state.auth.user);
  const clientConnectionStatus = useSelector((state: ReduxState) => state.editor.clientConnectionStatus);

  const connectionColor = React.useMemo(
    () =>
      clientConnectionStatus === 'Connected'
        ? palette.SUCCESS
        : clientConnectionStatus === 'Connecting'
        ? palette.WARNING
        : palette.GRAY,
    [clientConnectionStatus]
  );

  const dispatch = useDispatch();
  const dispatchSignOut = React.useCallback(() => dispatch(_auth.signOut()), [dispatch]);

  if (!user) {
    return null;
  }

  return (
    <div className={css(styles.profileButtonContainer)}>
      <UserAvatar
        placement="bottomEnd"
        user={user}
        defaultColor={palette.GRAY}
        statusColor={connectionColor}
        title={
          <div className={css(styles.profilePopoverTitle)}>
            <span>{user.name}</span>

            <IconButton
              style={{ marginLeft: spacing.DEFAULT }}
              appearance="subtle"
              icon={<Icon icon="pencil" />}
              disabled
            />
          </div>
        }
      >
        <div className={css(styles.profilePopoverContent)}>
          <span>{user.email}</span>

          <Button style={{ marginTop: spacing.DEFAULT }} onClick={dispatchSignOut}>
            <Icon icon="sign-out" /> Logout
          </Button>
        </div>
      </UserAvatar>
    </div>
  );
};

export default ProfileButton;
