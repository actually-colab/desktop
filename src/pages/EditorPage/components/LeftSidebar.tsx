import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Icon, IconButton, IconProps, Tooltip, Whisper } from 'rsuite';

import { palette, spacing, timing } from '../../../constants/theme';
import { HEADER_HEIGHT, LEFT_SIDEBAR_PANEL_WIDTH, LEFT_SIDEBAR_TRAY_WIDTH } from '../../../constants/dimensions';
import { openCompanion } from '../../../utils/redirect';

import { KernelPanel, ProjectsPanel } from '../LeftSidebar';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: palette.BASE_FADED,
  },
  titleContainer: {
    height: HEADER_HEIGHT,
    ...spacing.pad({ top: spacing.DEFAULT / 2 }),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    background: '-webkit-linear-gradient(top left, #f55673, #E2CC52)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
  },
  panel: {
    paddingTop: spacing.DEFAULT / 2,
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflowY: 'hidden',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderColor: palette.BASE_BORDER,
  },
  categoryContainer: {
    width: LEFT_SIDEBAR_TRAY_WIDTH,
    paddingBottom: spacing.DEFAULT / 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: palette.BASE_BORDER,
    '-webkit-user-select': 'none',
  },
  mainPanelCategories: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  category: {
    marginBottom: spacing.DEFAULT / 2,
    borderLeftStyle: 'solid',
    borderLeftWidth: 3,
    borderLeftColor: palette.BASE_FADED,
  },
  categoryActive: {
    borderLeftColor: palette.PRIMARY,
  },
  bodyContainer: {
    width: LEFT_SIDEBAR_PANEL_WIDTH,
    paddingLeft: spacing.DEFAULT,
    paddingRight: spacing.DEFAULT,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
});

/**
 * A styled button which indicates what panel is visible
 */
const CategoryButton: React.FC<{
  icon: IconProps['icon'];
  tooltipText: string;
  menuKey: string;
  activeMenuKey: string;
  onSelect(menu: string): void;
}> = ({ icon, tooltipText, menuKey, activeMenuKey, onSelect }) => {
  const isActive = menuKey === activeMenuKey;

  return (
    <Whisper
      placement="right"
      trigger="hover"
      delayShow={timing.SHOW_DELAY}
      delayHide={timing.HIDE_DELAY}
      speaker={<Tooltip>{tooltipText}</Tooltip>}
    >
      <div className={css(styles.category, isActive && styles.categoryActive)}>
        <IconButton
          style={{
            color: isActive ? palette.PRIMARY : palette.CHARCOAL,
            borderRadius: 0,
            backgroundColor: palette.BASE_FADED,
          }}
          size="lg"
          icon={<Icon icon={icon} />}
          onClick={() => onSelect(menuKey)}
        />
      </div>
    </Whisper>
  );
};

type MenuOption = '' | 'Projects' | 'Kernel';

const MENU_OPTIONS: { menuKey: MenuOption; icon: IconProps['icon']; disabled?: boolean }[] = [
  { menuKey: 'Projects', icon: 'edit' },
  { menuKey: 'Kernel', icon: 'related-map' },
];

/**
 * The left sidebar for the editor page
 */
const LeftSidebar: React.FC = () => {
  const [activeMenuKey, setActiveMenuKey] = React.useState<MenuOption>('Projects');

  const handleCategorySelect = React.useCallback(
    (menuKey: typeof activeMenuKey) => {
      if (activeMenuKey !== menuKey) {
        setActiveMenuKey(menuKey);
      }
    },
    [activeMenuKey]
  );

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.titleContainer)}>
        <p className={css(styles.title)}>actually colab</p>
      </div>
      <div className={css(styles.panel)}>
        <div className={css(styles.categoryContainer)}>
          <div className={css(styles.mainPanelCategories)}>
            {MENU_OPTIONS.filter((menu) => !menu.disabled).map((menu) => (
              <CategoryButton
                key={menu.menuKey}
                icon={menu.icon}
                tooltipText={menu.menuKey}
                menuKey={menu.menuKey}
                activeMenuKey={activeMenuKey}
                onSelect={handleCategorySelect}
              />
            ))}

            <Whisper
              placement="right"
              trigger="hover"
              delayShow={timing.SHOW_DELAY}
              delayHide={timing.HIDE_DELAY}
              speaker={<Tooltip>Launch Kernel Companion</Tooltip>}
            >
              <IconButton
                size="lg"
                appearance="subtle"
                icon={<Icon icon="external-link-square" size="lg" style={{ color: palette.PRIMARY }} />}
                onClick={() => openCompanion()}
              />
            </Whisper>
          </div>
        </div>

        <div className={css(styles.bodyContainer)}>
          {activeMenuKey === 'Projects' && <ProjectsPanel />}
          {activeMenuKey === 'Kernel' && <KernelPanel />}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
