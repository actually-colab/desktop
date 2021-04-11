import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { IconProps } from 'rsuite';

import { palette, spacing } from '../../../constants/theme';
import { RIGHT_SIDEBAR_PANEL_WIDTH, RIGHT_SIDEBAR_TRAY_WIDTH } from '../../../constants/dimensions';
import { ColoredIconButton } from '../../../components';
import { ChatPanel, CommentsPanel, DownloadsPanel, HelpPanel, SettingsPanel, StatsPanel } from '../RightSidebar';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: palette.BASE,
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderColor: palette.BASE_BORDER,
    display: 'flex',
    flexDirection: 'row',
  },
  navContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  menuButtons: {
    width: RIGHT_SIDEBAR_TRAY_WIDTH,
    display: 'flex',
    flexDirection: 'column',
  },
  pane: {
    width: RIGHT_SIDEBAR_PANEL_WIDTH,
    height: '100%',
    ...spacing.pad({ top: spacing.DEFAULT / 2 }),
    backgroundColor: palette.BASE_FADED,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  paneBody: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: spacing.DEFAULT / 2,
    flex: 1,
  },
});

type MenuOption = 'Chat' | 'Comments' | 'Stats' | 'Downloads' | 'Settings' | 'Help' | '';

const MENU_OPTIONS: { menuKey: MenuOption; icon: IconProps['icon']; disabled?: boolean }[] = [
  { menuKey: 'Chat', icon: 'commenting' },
  { menuKey: 'Comments', icon: 'comments' },
  { menuKey: 'Stats', icon: 'area-chart' },
  { menuKey: 'Downloads', icon: 'download2' },
  { menuKey: 'Settings', icon: 'wrench' },
  { menuKey: 'Help', icon: 'question' },
];

/**
 * The right sidebar for the editor page
 */
const RightSidebar: React.FC = () => {
  const [visibleMenu, setVisibleMenu] = React.useState<MenuOption>('');

  const openMenu = React.useCallback((menu: typeof visibleMenu) => {
    setVisibleMenu((prevMenu) => (prevMenu === menu ? '' : menu));
  }, []);

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.navContainer)}>
        <div className={css(styles.menuButtons)}>
          {MENU_OPTIONS.filter((menu) => !menu.disabled).map((menu) => (
            <ColoredIconButton
              key={menu.menuKey}
              active={visibleMenu === menu.menuKey}
              icon={menu.icon}
              tooltipText={menu.menuKey}
              tooltipDirection="left"
              onClick={() => openMenu(menu.menuKey)}
            />
          ))}
        </div>

        <ColoredIconButton
          size="lg"
          icon="arrow-right-line"
          tooltipText="Hide menu"
          tooltipDirection="left"
          disabled={visibleMenu === ''}
          onClick={() => setVisibleMenu('')}
        />
      </div>

      {visibleMenu !== '' && (
        <div className={css(styles.pane)}>
          <h4>{visibleMenu}</h4>

          <div className={css(styles.paneBody)}>
            {visibleMenu === 'Chat' && <ChatPanel />}
            {visibleMenu === 'Comments' && <CommentsPanel />}
            {visibleMenu === 'Stats' && <StatsPanel />}
            {visibleMenu === 'Downloads' && <DownloadsPanel />}
            {visibleMenu === 'Settings' && <SettingsPanel />}
            {visibleMenu === 'Help' && <HelpPanel />}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
