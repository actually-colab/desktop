import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Dropdown, Icon, Input, InputGroup, Modal } from 'rsuite';

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

/**
 * The projects panel for the left sidebar of the editor page
 */
const ProjectsPanel: React.FC = () => {
  const projects = useSelector((state: ReduxState) => state.editor.projects);

  const [showCreateProject, setShowCreateProject] = React.useState<boolean>(false);
  const [newProjectName, setNewProjectName] = React.useState<string>('');

  return (
    <React.Fragment>
      <div className={css(styles.newProjectContainer)}>
        <Button
          appearance="primary"
          size="lg"
          block
          onClick={() => {
            setShowCreateProject(true);
            setNewProjectName('');
          }}
        >
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

      <Modal size="xs" show={showCreateProject} onHide={() => setShowCreateProject(false)}>
        <Modal.Header>
          <Modal.Title>New Project Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input
            value={newProjectName}
            onChange={(value: string) => setNewProjectName(value)}
            placeholder="Project name"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="subtle" onClick={() => setShowCreateProject(false)}>
            Cancel
          </Button>
          <Button appearance="primary">Create</Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default ProjectsPanel;
