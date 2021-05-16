import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import { spacing } from '../../../../constants/theme';
import { ReduxState } from '../../../../types/redux';
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
});

/**
 * Component showing all the active users on a notebook
 */
const UserAvatarList: React.FC = () => {
  const users = useSelector((state: ReduxState) => state.editor.users);

  return (
    <div className={css(styles.avatarsContainer)}>
      {users.map((activeUser) => (
        <div className={css(styles.avatar)} key={activeUser.uid}>
          <UserAvatar placement="bottomEnd" user={activeUser} />
        </div>
      ))}
    </div>
  );
};

export default UserAvatarList;
