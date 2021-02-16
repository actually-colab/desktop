import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Avatar, Badge, Popover, Whisper, WhisperProps } from 'rsuite';

import { User } from '../types/user';
import { palette } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

const UserAvatar: React.FC<{
  user: User;
  placement?: WhisperProps['placement'];
  userColor?: string;
  statusColor?: string;
  title?: React.ReactNode;
}> = ({ user, placement, userColor = palette.OLD_LAVENDER, statusColor, title, children }) => {
  const userInitials = React.useMemo(() => {
    const piecesOfName = user.name.split(' ');

    if (piecesOfName.length === 1) {
      return user.name[0].toUpperCase();
    }

    return `${piecesOfName[0][0]}${piecesOfName[1][0]}`.toUpperCase();
  }, [user.name]);

  return (
    <Whisper
      placement={placement}
      trigger="hover"
      enterable
      speaker={
        <Popover title={title !== undefined ? title : user.name}>
          {children !== undefined ? children : user.uid}
        </Popover>
      }
    >
      <div className={css(styles.container)}>
        <Avatar style={{ background: userColor }} size="sm" circle>
          {userInitials}
        </Avatar>

        {statusColor !== undefined && (
          <Badge
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: statusColor,
            }}
          />
        )}
      </div>
    </Whisper>
  );
};

export default UserAvatar;
