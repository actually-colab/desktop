import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import {
  Button,
  ControlLabel,
  Dropdown,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Modal,
  Schema,
} from 'rsuite';
import { FormInstance } from 'rsuite/lib/Form';
import { Notebook } from '@actually-colab/editor-types';

import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';
import { palette, spacing } from '../../../constants/theme';
import { PopoverDropdown } from '../../../components';

type NewProjectFormValue = {
  name: string;
};

/**
 * The rsuite model to check if the new project form is valid
 */
const newProjectModel = Schema.Model({
  name: Schema.Types.StringType().containsLetter('This field is required').isRequired('This field is required'),
});

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
  projectListHeader: {
    marginLeft: -spacing.DEFAULT / 2,
    marginRight: -spacing.DEFAULT / 2,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortText: {},
  project: {
    marginLeft: -spacing.DEFAULT / 2,
    marginRight: -spacing.DEFAULT / 2,
    marginBottom: spacing.DEFAULT / 4,
  },
  projectButton: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectActive: {
    background: palette.PRIMARY_LIGHT,
    color: palette.PRIMARY,
  },
  projectTitleContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  projectTitle: {
    marginLeft: spacing.DEFAULT / 2,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  lastModifiedText: {
    marginLeft: spacing.DEFAULT / 4,
    color: palette.GRAY,
  },
  requiredText: {
    marginLeft: spacing.DEFAULT / 2,
    color: palette.ERROR,
  },
});

/**
 * The projects panel for the left sidebar of the editor page
 */
const ProjectsPanel: React.FC = () => {
  const newProjectFormRef = React.useRef<FormInstance>();

  const isGettingNotebooks = useSelector((state: ReduxState) => state.editor.isGettingNotebooks);
  const isCreatingNotebook = useSelector((state: ReduxState) => state.editor.isCreatingNotebook);
  const isOpeningNotebook = useSelector((state: ReduxState) => state.editor.isOpeningNotebook);
  const openingNotebookId = useSelector((state: ReduxState) => state.editor.openingNotebookId);
  const notebooks = useSelector((state: ReduxState) => state.editor.notebooks);
  const notebook = useSelector((state: ReduxState) => state.editor.notebook);

  const [showCreateProject, setShowCreateProject] = React.useState<boolean>(false);
  const [newProjectFormValue, setNewProjectFormValue] = React.useState<NewProjectFormValue>({
    name: '',
  });

  const dispatch = useDispatch();
  const dispatchGetNotebooks = React.useCallback(() => dispatch(_editor.getNotebooks()), [dispatch]);
  const dispatchCreateNotebook = React.useCallback(
    () => newProjectFormRef.current?.check() && dispatch(_editor.createNotebook(newProjectFormValue.name)),
    [dispatch, newProjectFormValue.name]
  );
  const dispatchOpenNotebook = React.useCallback((nb_id: Notebook['nb_id']) => dispatch(_editor.openNotebook(nb_id)), [
    dispatch,
  ]);

  const handleNewProjectFormSubmit = React.useCallback(
    (_, event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      dispatchCreateNotebook();
    },
    [dispatchCreateNotebook]
  );

  /**
   * Auto close modal when create project switches to false
   */
  React.useEffect(() => {
    if (!isCreatingNotebook) {
      setShowCreateProject(false);
    }
  }, [isCreatingNotebook]);

  return (
    <React.Fragment>
      <div className={css(styles.newProjectContainer)}>
        <Button
          appearance="primary"
          size="lg"
          block
          onClick={() => {
            setShowCreateProject(true);
            setNewProjectFormValue({ name: '' });
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

      <div className={css(styles.projectListHeader)}>
        <PopoverDropdown
          appearance="subtle"
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

        <IconButton
          icon={<Icon icon="refresh" />}
          appearance="subtle"
          loading={isGettingNotebooks}
          onClick={dispatchGetNotebooks}
        />
      </div>

      {notebooks.map((project) => {
        const active = project.nb_id === notebook?.nb_id;

        return (
          <div key={project.nb_id} className={css(styles.project)}>
            <Button
              block
              className={css(styles.projectButton, active && styles.projectActive)}
              loading={project.nb_id === openingNotebookId}
              onClick={() => !isOpeningNotebook && !active && dispatchOpenNotebook(project.nb_id)}
            >
              <div className={css(styles.projectTitleContainer)}>
                <Icon icon={active ? 'file' : 'file-o'} />
                <span className={css(styles.projectTitle)}>{project.name}</span>
              </div>
              <span className={css(styles.lastModifiedText)}>10m</span>
            </Button>
          </div>
        );
      })}

      <Modal
        size="xs"
        autoFocus
        show={showCreateProject}
        onHide={() => !isCreatingNotebook && setShowCreateProject(false)}
      >
        <Modal.Header>
          <Modal.Title>New Project Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            ref={newProjectFormRef}
            autoComplete="off"
            fluid
            model={newProjectModel}
            onChange={(formValue) => setNewProjectFormValue(formValue as NewProjectFormValue)}
            onSubmit={handleNewProjectFormSubmit}
          >
            <FormGroup>
              <ControlLabel>
                Project Name <span className={css(styles.requiredText)}>Required</span>
              </ControlLabel>
              <FormControl name="name" label="Project Name" placeholder="Project Name" />
              <HelpBlock>This will be the name of your new notebook</HelpBlock>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="subtle" disabled={isCreatingNotebook} onClick={() => setShowCreateProject(false)}>
            Cancel
          </Button>
          <Button appearance="primary" loading={isCreatingNotebook} onClick={dispatchCreateNotebook}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default ProjectsPanel;
