import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Popover, Whisper } from 'rsuite';

import { ReduxState } from '../../../../types/redux';
import { spacing } from '../../../../constants/theme';
import { UserAvatar } from '../../../../components';

const styles = StyleSheet.create({
  avatarsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: spacing.DEFAULT / 2,
  },
  popoverContainer: {
    padding: spacing.DEFAULT,
  },
  userListItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userListTextContainer: {
    marginLeft: spacing.DEFAULT,
    display: 'flex',
    flexDirection: 'column',
  },
  userTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  userSubtitle: {
    fontSize: 11,
    fontWeight: 'normal',
    display: 'flex',
    flexDirection: 'row',
  },
});

/**
 * Component showing all the active users on a notebook
 */
const UserAvatarList: React.FC = () => {
  const users = useSelector((state: ReduxState) => state.editor.users);

  return (
    <div className={css(styles.avatarsContainer)}>
      {users.size <= 3 ? (
        users.map((activeUser) => (
          <div className={css(styles.avatar)} key={activeUser.uid}>
            <UserAvatar user={activeUser} placement="bottomEnd" />
          </div>
        ))
      ) : (
        <Whisper
          trigger="click"
          placement="bottom"
          speaker={
            <Popover full style={{ border: '1px solid #ddd' }}>
              <div className={css(styles.popoverContainer)}>
                {users.map((activeUser) => (
                  <div key={activeUser.uid} className={css(styles.userListItem)}>
                    <UserAvatar user={activeUser} hover={false} />

                    <div className={css(styles.userListTextContainer)}>
                      <span className={css(styles.userTitle)}>{activeUser.name}</span>
                      <span className={css(styles.userSubtitle)}>{activeUser.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Popover>
          }
        >
          <Button size="sm">{users.size} users</Button>
        </Whisper>
      )}
    </div>
  );
};

export default UserAvatarList;
