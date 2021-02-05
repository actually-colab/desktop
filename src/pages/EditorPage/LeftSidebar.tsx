import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Dropdown, Icon, Nav, Sidenav } from 'rsuite';

const styles = StyleSheet.create({
  container: {
    width: 250,
    display: 'flex',
    flexDirection: 'column',
    '-webkit-user-select': 'none',
  },
  titleContainer: {
    marginTop: 8,
  },
  title: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: 'bold',
    background: '-webkit-linear-gradient(top left, #E27686, #E2CC52)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
  },
});

const LeftSidebar: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <Sidenav defaultOpenKeys={['projects']} style={{ flexGrow: 1 }}>
        <Sidenav.Header>
          <div className={css(styles.titleContainer)}>
            <span className={css(styles.title)}>actually colab</span>
          </div>
        </Sidenav.Header>
        <Sidenav.Body>
          <Nav>
            <Dropdown eventKey="projects" title="Projects" icon={<Icon icon="code" />}>
              <Dropdown.Item>Example Project</Dropdown.Item>
            </Dropdown>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
};

export default LeftSidebar;
