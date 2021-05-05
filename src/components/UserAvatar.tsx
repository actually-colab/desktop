import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Avatar, Badge, Popover, Whisper, WhisperProps } from 'rsuite';
import type { DUser } from '@actually-colab/editor-types';

import type { ImmutableNotebookAccessLevel, ImmutableUser, ImmutableWorkshopAccessLevel } from '../immutable';
import { randomColor } from '../utils/color';

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
  user: DUser | ImmutableUser | ImmutableNotebookAccessLevel | ImmutableWorkshopAccessLevel;
  hover?: boolean;
  placement?: WhisperProps['placement'];
  statusColor?: string;
  defaultColor?: string;
  title?: React.ReactNode;
}> = ({ user, hover = true, placement, statusColor, title, defaultColor, children }) => {
  const userInitials = React.useMemo(() => {
    const piecesOfName = (user.name ?? 'Unknown').split(' ');

    if (piecesOfName.length === 1) {
      return piecesOfName[0][0].toUpperCase();
    }

    return `${piecesOfName[0][0]}${piecesOfName[1][0]}`.toUpperCase();
  }, [user.name]);

  const userColor = React.useMemo(
    () =>
      randomColor({
        seed: user.uid,
      }),
    [user.uid]
  );

  const CoreAvatar = (
    <div className={css(styles.container)}>
      {user.image_url ? (
        <Avatar
          style={
            defaultColor === undefined
              ? {
                  borderRadius: '50%',
                  borderStyle: 'solid',
                  borderWidth: 2,
                  borderColor: userColor,
                }
              : undefined
          }
          size="sm"
          circle
          src={user.image_url}
          alt={userInitials}
        />
      ) : (
        <Avatar style={{ background: defaultColor ?? userColor }} size="sm" circle>
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
