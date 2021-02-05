import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Divider, Icon, IconButton, IconProps, Placeholder, Tooltip, Whisper } from 'rsuite';

import { palette, spacing } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderColor: palette.BASE_BORDER,
    display: 'flex',
    flexDirection: 'row',
  },
  navContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  pane: {
    width: 250,
    height: '100%',
    ...spacing.pad(spacing.DEFAULT, { top: spacing.DEFAULT / 2 }),
    backgroundColor: palette.BASE_FADED,
    overflowY: 'auto',
  },
});

const SidebarButton: React.FC<{
  icon: IconProps['icon'];
  color?: string;
  tooltipText: string;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick(): void;
}> = ({ tooltipText, icon, color, active = false, disabled = false, loading = false, onClick }) => {
  return (
    <Whisper placement="left" trigger="hover" speaker={<Tooltip>{tooltipText}</Tooltip>}>
      <IconButton
        appearance="subtle"
        size="md"
        icon={<Icon icon={icon} style={color && !disabled && !loading ? { color } : undefined} />}
        active={active}
        disabled={disabled || loading}
        loading={loading}
        onClick={onClick}
      />
    </Whisper>
  );
};

const RightSidebar: React.FC = () => {
  const [visibleMenu, setVisibleMenu] = React.useState<string>('');

  const openMenu = React.useCallback(
    (menu: string) => {
      if (visibleMenu === menu) {
        setVisibleMenu('');
      } else {
        setVisibleMenu(menu);
      }
    },
    [visibleMenu]
  );

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.navContainer)}>
        <SidebarButton icon="play" color={palette.SUCCESS} tooltipText="Run Cell" onClick={() => console.log('TODO')} />
        <SidebarButton icon="stop" color={palette.ERROR} tooltipText="Stop Cell" onClick={() => console.log('TODO')} />

        <Divider style={{ marginTop: 0, marginBottom: 0 }} />

        <SidebarButton
          active={visibleMenu === 'Collaborators'}
          icon="group"
          tooltipText="Collaborators"
          onClick={() => openMenu('Collaborators')}
        />
        <SidebarButton
          active={visibleMenu === 'Kernel Logs'}
          icon="tasks"
          tooltipText="Kernel Logs"
          onClick={() => openMenu('Kernel Logs')}
        />
        <SidebarButton
          active={visibleMenu === 'Downloads'}
          icon="download"
          tooltipText="Downloads"
          onClick={() => openMenu('Downloads')}
        />
        <SidebarButton
          active={visibleMenu === 'Settings'}
          icon="gear-circle"
          tooltipText="Settings"
          onClick={() => openMenu('Settings')}
        />
      </div>

      {visibleMenu !== '' && (
        <div className={css(styles.pane)}>
          <h6>{visibleMenu}</h6>

          <Placeholder.Paragraph rows={30} active />
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
