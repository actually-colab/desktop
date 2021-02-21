import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Dropdown, Icon, Input, InputGroup } from 'rsuite';

import { ReduxState } from '../../../redux';
import { palette, spacing } from '../../../constants/theme';
import { PopoverDropdown } from '../../../components';

const styles = StyleSheet.create({
  newProjectContainer: {
    marginBottom: spacing.DEFAULT,
  },
  iconButtonText: {
    marginLeft: spacing.DEFAULT / 2,
  },
  searchContainer: {
    marginBottom: spacing.DEFAULT,
  },
  sortText: {},
  project: {
    marginBottom: spacing.DEFAULT / 2,
  },
});

const ProjectsPanel: React.FC = () => {
  const projects = useSelector((state: ReduxState) => state.editor.projects);

  return (
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
        activeKey="name"
        buttonProps={{
          ripple: false,
        }}
      >
        <Dropdown.Item eventKey="name">Sort by name</Dropdown.Item>
        <Dropdown.Item eventKey="edited">Sort by edited</Dropdown.Item>
      </PopoverDropdown>

      {projects.map((project) => (
        <div key={project.nb_id} className={css(styles.project)}>
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
  );
};

export default ProjectsPanel;
