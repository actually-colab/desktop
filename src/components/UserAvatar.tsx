import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Avatar, Badge, Popover, Whisper, WhisperProps } from 'rsuite';
import type { DUser } from '@actually-colab/editor-types';

import type { ImmutableNotebookAccessLevel } from '../immutable';
import { palette } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 30,
    height: 30,
  },
});

/**
 * A component for rendering an avatar with a status badge
 */
const UserAvatar: React.FC<{
  user: DUser | ImmutableNotebookAccessLevel;
  hover?: boolean;
  placement?: WhisperProps['placement'];
  userColor?: string;
  statusColor?: string;
  title?: React.ReactNode;
}> = ({ user, hover = true, placement, userColor = palette.TANGERINE, statusColor, title, children }) => {
  const userInitials = React.useMemo(() => {
    const piecesOfName = (user.name ?? 'Unknown').split(' ');

    if (piecesOfName.length === 1) {
      return piecesOfName[0][0].toUpperCase();
    }

    return `${piecesOfName[0][0]}${piecesOfName[1][0]}`.toUpperCase();
  }, [user.name]);

  const CoreAvatar = (
    <div className={css(styles.container)}>
      {user.image_url ? (
        <Avatar size="sm" circle src={user.image_url} alt={userInitials} />
      ) : (
        <Avatar style={{ background: userColor }} size="sm" circle>
          {userInitials}
        </Avatar>
      )}

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
  );

  if (!hover) {
    return CoreAvatar;
  }

  return (
    <Whisper
      placement={placement}
      trigger="hover"
      enterable
      speaker={
        <Popover title={title !== undefined ? title : user.name}>
          {children !== undefined ? children : user.email}
        </Popover>
      }
    >
      {CoreAvatar}
    </Whisper>
  );
};

export default UserAvatar;
