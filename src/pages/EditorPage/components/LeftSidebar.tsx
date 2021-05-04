import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon, IconButton, IconProps, Tooltip, Whisper } from 'rsuite';

import { ReduxState } from '../../../types/redux';
import { _auth } from '../../../redux/actions';
import { palette, spacing, timing } from '../../../constants/theme';
import { HEADER_HEIGHT, LEFT_SIDEBAR_PANEL_WIDTH, LEFT_SIDEBAR_TRAY_WIDTH } from '../../../constants/dimensions';
import { openCompanion, openGithub } from '../../../utils/redirect';
import { UserAvatar } from '../../../components';

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
  endPanelCategories: {
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
  profilePopoverTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePopoverContent: {
    display: 'flex',
    flexDirection: 'column',
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

type MenuOption = '' | 'Projects' | 'Kernel' | 'Contacts' | 'Settings';

const MENU_OPTIONS: { menuKey: MenuOption; icon: IconProps['icon']; disabled?: boolean }[] = [
  { menuKey: 'Projects', icon: 'edit' },
  { menuKey: 'Contacts', icon: 'peoples' },
  { menuKey: 'Kernel', icon: 'related-map' },
];

/**
 * The left sidebar for the editor page
 */
const LeftSidebar: React.FC = () => {
  const user = useSelector((state: ReduxState) => state.auth.user);
  const clientConnectionStatus = useSelector((state: ReduxState) => state.editor.clientConnectionStatus);

  const [activeMenuKey, setActiveMenuKey] = React.useState<MenuOption>('Projects');

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

          <div className={css(styles.endPanelCategories)}>
            <IconButton
              size="lg"
              appearance="subtle"
              icon={<Icon icon="github" style={{ color: palette.CHARCOAL, fontSize: 20 }} />}
              onClick={() => openGithub()}
            />
            <CategoryButton
              icon="gear"
              tooltipText="Settings"
              menuKey="Settings"
              activeMenuKey={activeMenuKey}
              onSelect={handleCategorySelect}
            />

            {user !== null && (
              <UserAvatar
                placement="rightEnd"
                user={user}
                defaultColor={palette.CHARCOAL}
                statusColor={connectionColor}
                title={
                  <div className={css(styles.profilePopoverTitle)}>
                    <span>{user.name}</span>

                    <IconButton
                      style={{ marginLeft: spacing.DEFAULT }}
                      appearance="subtle"
                      icon={<Icon icon="pencil" />}
                      disabled
                      onClick={() => setActiveMenuKey('Settings')}
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
            )}
          </div>
        </div>

        <div className={css(styles.bodyContainer)}>
          {activeMenuKey === 'Projects' && <ProjectsPanel />}
          {activeMenuKey === 'Contacts' && <p>Coming soon</p>}
          {activeMenuKey === 'Kernel' && <KernelPanel />}
          {activeMenuKey === 'Settings' && <p>Coming soon</p>}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
