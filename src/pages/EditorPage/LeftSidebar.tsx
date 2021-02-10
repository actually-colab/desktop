import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Icon,
  IconButton,
  IconProps,
  Input,
  InputGroup,
  Tooltip,
  Whisper,
} from 'rsuite';

import { palette, spacing } from '../../constants/theme';
import { PopoverDropdown } from '../../components';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: palette.BASE_FADED,
  },
  titleContainer: {
    marginLeft: spacing.DEFAULT,
    marginRight: spacing.DEFAULT,
    marginBottom: spacing.DEFAULT,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    background: '-webkit-linear-gradient(top left, #f55673, #E2CC52)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
  },
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  },
  categoryContainer: {
    width: 46,
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
  avatar: {
    position: 'relative',
  },
  bodyContainer: {
    width: 220,
    paddingLeft: spacing.DEFAULT,
    paddingRight: spacing.DEFAULT,
    display: 'flex',
    flexDirection: 'column',
    '-webkit-user-select': 'none',
  },
  iconButtonText: {
    marginLeft: spacing.DEFAULT / 2,
  },
  newProjectContainer: {
    marginBottom: spacing.DEFAULT,
  },
  searchContainer: {
    marginBottom: spacing.DEFAULT,
  },
  sortText: {},
  project: {
    marginBottom: spacing.DEFAULT / 2,
  },
});

const CategoryButton: React.FC<{
  icon: IconProps['icon'];
  tooltipText: string;
  menuKey: string;
  activeMenuKey: string;
  onSelect(menu: string): void;
}> = ({ icon, tooltipText, menuKey, activeMenuKey, onSelect }) => {
  const isActive = menuKey === activeMenuKey;

  return (
    <Whisper placement="right" trigger="hover" delay={500} speaker={<Tooltip>{tooltipText}</Tooltip>}>
      <div className={css(isActive ? [styles.category, styles.categoryActive] : styles.category)}>
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

const LeftSidebar: React.FC = () => {
  const projects = [
    {
      _id: 'some-id',
      name: 'Example Project',
    },
  ];

  const [activeMenuKey, setActiveMenuKey] = React.useState<'' | 'projects' | 'kernel' | 'follow' | 'settings'>(
    'projects'
  );

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
            <CategoryButton
              icon="edit"
              tooltipText="Projects"
              menuKey="projects"
              activeMenuKey={activeMenuKey}
              onSelect={handleCategorySelect}
            />
            <CategoryButton
              icon="peoples"
              tooltipText="Contacts"
              menuKey="follow"
              activeMenuKey={activeMenuKey}
              onSelect={handleCategorySelect}
            />
            <CategoryButton
              icon="related-map"
              tooltipText="Kernel"
              menuKey="kernel"
              activeMenuKey={activeMenuKey}
              onSelect={handleCategorySelect}
            />
          </div>

          <div className={css(styles.endPanelCategories)}>
            <CategoryButton
              icon="gear"
              tooltipText="Settings"
              menuKey="settings"
              activeMenuKey={activeMenuKey}
              onSelect={handleCategorySelect}
            />

            <div className={css(styles.avatar)}>
              <Avatar style={{ background: palette.CHARCOAL }} size="sm" circle>
                JT
              </Avatar>
              <Badge style={{ position: 'absolute', bottom: 0, right: 0, background: palette.SUCCESS }} />
            </div>
          </div>
        </div>

        <div className={css(styles.bodyContainer)}>
          {activeMenuKey === 'projects' ? (
            <React.Fragment>
              <div className={css(styles.newProjectContainer)}>
                <Button appearance="primary" size="lg" block>
                  <Icon icon="edit" size="lg" />
                  <span className={css(styles.iconButtonText)}>New project</span>
                </Button>
              </div>

              <div className={css(styles.searchContainer)}>
                <InputGroup>
                  <Input style={{ backgroundColor: palette.BASE_FADED }} size="lg" placeholder="Search projects" />

                  <InputGroup.Addon>
                    <Icon icon="search" />
                  </InputGroup.Addon>
                </InputGroup>
              </div>

              <PopoverDropdown
                placement="rightStart"
                buttonContent={<span className={css(styles.sortText)}>Sort by name</span>}
                buttonProps={{
                  ripple: false,
                }}
              >
                <Dropdown.Item>Sort by name</Dropdown.Item>
              </PopoverDropdown>

              {projects.map((project) => (
                <div key={project._id} className={css(styles.project)}>
                  <Button
                    block
                    style={{
                      textAlign: 'left',
                      background: palette.PRIMARY_LIGHT,
                      color: palette.PRIMARY,
                    }}
                  >
                    {project.name}
                  </Button>
                </div>
              ))}
            </React.Fragment>
          ) : (
            <React.Fragment />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
