import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Button, Dropdown, Icon, Input, InputGroup, Nav, Sidenav } from 'rsuite';

import { palette, spacing } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    width: 220,
    display: 'flex',
    flexDirection: 'column',
    '-webkit-user-select': 'none',
  },
  titleContainer: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: spacing.DEFAULT,
  },
  title: {
    marginBottom: spacing.DEFAULT,
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
  return (
    <div className={css(styles.container)}>
      <Sidenav activeKey="projects-some-id" defaultOpenKeys={['projects']} style={{ flexGrow: 1 }}>
        <Sidenav.Header>
          <div className={css(styles.titleContainer)}>
            <p className={css(styles.title)}>actually colab</p>

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
        </Sidenav.Header>
        <Sidenav.Body>
          <Nav>
            <Dropdown eventKey="projects" title="Projects" icon={<Icon icon="code" />}>
              <Dropdown.Item eventKey="projects-some-id">Example Project</Dropdown.Item>
            </Dropdown>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
};

export default LeftSidebar;
