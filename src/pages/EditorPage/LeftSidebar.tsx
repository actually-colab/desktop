import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Avatar, Badge, Button, Dropdown, Icon, IconButton, Input, InputGroup, Nav, Sidenav } from 'rsuite';

import { palette, spacing } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: palette.BASE_FADED,
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
  bodyContainer: {
    width: 220,
    paddingLeft: spacing.DEFAULT,
    paddingRight: spacing.DEFAULT,
    display: 'flex',
    flexDirection: 'column',
    '-webkit-user-select': 'none',
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
  iconButtonText: {
    marginLeft: spacing.DEFAULT / 2,
  },
  newProjectContainer: {
    marginBottom: spacing.DEFAULT,
  },
  searchContainer: {},
});

const LeftSidebar: React.FC = () => {
  const projects = [
    {
      _id: 'some-id',
      name: 'Example Project',
    },
  ];

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.titleContainer)}>
        <p className={css(styles.title)}>actually colab</p>
      </div>
      <div className={css(styles.panel)}>
        <div className={css(styles.categoryContainer)}>
          <div className={css(styles.mainPanelCategories)}>
            <div className={css([styles.category, styles.categoryActive])}>
              <IconButton style={{ color: palette.PRIMARY }} size="lg" icon={<Icon icon="pencil" />} />
            </div>
            <div className={css(styles.category)}>
              <IconButton size="lg" icon={<Icon icon="user-plus" />} />
            </div>
          </div>

          <div className={css(styles.endPanelCategories)}>
            <div className={css(styles.category)}>
              <IconButton size="lg" icon={<Icon icon="cog" />} />
            </div>

            <Avatar style={{ background: palette.CHARCOAL }} size="sm" circle>
              JT
            </Avatar>
            <Badge style={{ position: 'absolute', bottom: 9, left: 31, background: palette.SUCCESS }} />
          </div>
        </div>

        <div className={css(styles.bodyContainer)}>
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
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
