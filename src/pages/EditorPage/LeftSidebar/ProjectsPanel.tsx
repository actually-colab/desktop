import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import {
  Button,
  ControlLabel,
  Divider,
  Dropdown,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
  Icon,
  IconButton,
  IconProps,
  Input,
  InputGroup,
  Modal,
  Schema,
  Uploader,
} from 'rsuite';
import { FormInstance } from 'rsuite/lib/Form';
import { FileType } from 'rsuite/lib/Uploader';
import debounce from 'lodash.debounce';
import { DCell, Notebook } from '@actually-colab/editor-types';

import { ReduxState } from '../../../types/redux';
import { _editor, _ui } from '../../../redux/actions';
import { timeSince } from '../../../utils/date';
import { palette, spacing } from '../../../constants/theme';
import { PopoverDropdown } from '../../../components';
import { convertTextToCells, filterNotebookByName, sortNotebookBy } from '../../../utils/notebook';

type NewProjectFormValue = {
  name: string;
  description: string;
};

/**
 * The rsuite model to check if the new project form is valid
 */
const newProjectModel = Schema.Model({
  name: Schema.Types.StringType().containsLetter('This field is required').isRequired('This field is required'),
  description: Schema.Types.StringType(),
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
  searchAddon: {
    backgroundColor: palette.BASE,
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
  dividerText: {
    color: palette.GRAY,
  },
  descriptionText: {
    color: palette.GRAY,
    fontSize: 12,
  },
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
  lastModifiedTextDisabled: {
    color: palette.LIGHT_GRAY,
  },
  requiredText: {
    marginLeft: spacing.DEFAULT / 2,
    color: palette.ERROR,
  },
});

const ProjectButton: React.FC<{
  icon: IconProps['icon'];
  name: string;
  time_modified: number;
  loading: boolean;
  disabled: boolean;
  active: boolean;
  onClick(): void;
}> = ({ icon, name, time_modified, loading, disabled, active, onClick }) => {
  const timeSinceModification = timeSince(time_modified);

  return (
    <div className={css(styles.project)}>
      <Button
        block
        className={css(styles.projectButton, active && styles.projectActive)}
        loading={loading}
        disabled={disabled}
        onClick={onClick}
      >
        <div className={css(styles.projectTitleContainer)}>
          <Icon icon={icon} />
          <span className={css(styles.projectTitle)}>{name}</span>
        </div>
        <span className={css(styles.lastModifiedText, disabled && styles.lastModifiedTextDisabled)}>
          {timeSinceModification}
        </span>
      </Button>
    </div>
  );
};

/**
 * The projects panel for the left sidebar of the editor page
 */
const ProjectsPanel: React.FC = () => {
  const newProjectFormRef = React.useRef<FormInstance>();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const isGettingNotebooks = useSelector((state: ReduxState) => state.editor.isGettingNotebooks);
  const isGettingWorkshops = useSelector((state: ReduxState) => state.editor.isGettingWorkshops);
  const isCreatingNotebook = useSelector((state: ReduxState) => state.editor.isCreatingNotebook);
  const isOpeningNotebook = useSelector((state: ReduxState) => state.editor.isOpeningNotebook);
  const openingNotebookId = useSelector((state: ReduxState) => state.editor.openingNotebookId);
  const notebooks = useSelector((state: ReduxState) => state.editor.notebooks);
  const notebook = useSelector((state: ReduxState) => state.editor.notebook);
  const workshops = useSelector((state: ReduxState) => state.editor.workshops);

  const [searchText, setSearchText] = React.useState<string>('');
  const [filterValue, setFilterValue] = React.useState<string>('');
  const [sortType, setSortType] = React.useState<'name' | 'modified'>('modified');
  const [showCreateProject, setShowCreateProject] = React.useState<boolean>(false);
  const [newProjectType, setNewProjectType] = React.useState<'Notebook' | 'Workshop'>('Notebook');
  const [newProjectFormValue, setNewProjectFormValue] = React.useState<NewProjectFormValue>({
    name: '',
    description: '',
  });
  const [uploadedFileList, setUploadedFileList] = React.useState<FileType[]>([]);
  const [uploadedContent, setUploadedContent] = React.useState<Pick<DCell, 'language' | 'contents'>[]>([]);

  const dispatch = useDispatch();
  const dispatchGetNotebooks = React.useCallback(() => dispatch(_editor.getNotebooks()), [dispatch]);
  const dispatchGetWorkshops = React.useCallback(() => dispatch(_editor.getWorkshops()), [dispatch]);
  const dispatchCreateNotebook = React.useCallback(
    () =>
      newProjectFormRef.current?.check() && dispatch(_editor.createNotebook(newProjectFormValue.name, uploadedContent)),
    [dispatch, newProjectFormValue.name, uploadedContent]
  );
  const dispatchCreateWorkshop = React.useCallback(
    () =>
      newProjectFormRef.current?.check() &&
      dispatch(_editor.createWorkshop(newProjectFormValue.name, newProjectFormValue.description, uploadedContent)),
    [dispatch, newProjectFormValue.description, newProjectFormValue.name, uploadedContent]
  );
  const dispatchOpenNotebook = React.useCallback((nb_id: Notebook['nb_id']) => dispatch(_editor.openNotebook(nb_id)), [
    dispatch,
  ]);

  /* eslint-disable react-hooks/exhaustive-deps */
  const debouncedSetFilterValue = React.useCallback(
    debounce((newValue: string) => setFilterValue(newValue), 1000),
    []
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleUploadFile = React.useCallback(
    async (files: FileType[]) => {
      if (files.length === 0) {
        // File was removed
        setUploadedContent([]);
        setUploadedFileList([]);
        return;
      }

      try {
        const content = await files[0].blobFile?.text();
        console.log('Uploaded file text', { content });

        const cells = convertTextToCells(content ?? '');
        console.log('Uploaded file cells', cells);

        if (cells !== null) {
          setUploadedContent(cells);
          setUploadedFileList(files);
          return;
        }
      } catch (error) {
        setUploadedContent([]);
      }

      // Could not validate file
      dispatch(
        _ui.notify({
          level: 'error',
          title: 'Failed to upload notebook',
          message: 'Notebook was not the correct format or the upload failed for unknown reasons',
          duration: 5000,
        })
      );
    },
    [dispatch]
  );

  const handleNewProjectFormSubmit = React.useCallback(
    (_, event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (newProjectType === 'Notebook') {
        dispatchCreateNotebook();
      } else {
        dispatchCreateWorkshop();
      }
    },
    [dispatchCreateNotebook, dispatchCreateWorkshop, newProjectType]
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
        <PopoverDropdown
          placement="rightStart"
          buttonProps={{ appearance: 'primary', size: 'lg', block: true }}
          buttonContent={
            <div>
              <Icon icon="edit" size="lg" />
              <span className={css(styles.iconButtonText)}>New project</span>
            </div>
          }
          onSelect={(eventKey: string) => {
            setShowCreateProject(true);
            setNewProjectType(eventKey as typeof newProjectType);
            setNewProjectFormValue({
              name: '',
              description: '',
            });
            setUploadedContent([]);
            setUploadedFileList([]);
          }}
        >
          <Dropdown.Item eventKey="Notebook" icon={<Icon icon="file" />}>
            New Notebook
          </Dropdown.Item>
          <Dropdown.Item eventKey="Workshop" icon={<Icon icon="mortar-board" />}>
            New Workshop
          </Dropdown.Item>
        </PopoverDropdown>
      </div>

      <div className={css(styles.searchContainer)}>
        <InputGroup>
          <Input
            size="lg"
            placeholder="Search projects"
            value={searchText}
            onChange={(newValue: string) => {
              setSearchText(newValue);
              debouncedSetFilterValue(newValue);
            }}
          />

          <InputGroup.Addon className={css(styles.searchAddon)}>
            <Icon icon="search" />
          </InputGroup.Addon>
        </InputGroup>
      </div>

      <div className={css(styles.projectListHeader)}>
        <PopoverDropdown
          appearance="subtle"
          placement="rightStart"
          buttonContent={
            <span className={css(styles.sortText)}>
              {sortType === 'name' ? 'Sort by name' : 'Sort by last modified'}
            </span>
          }
          activeKey={sortType}
          buttonProps={{
            ripple: false,
          }}
          onSelect={(eventKey: string) => setSortType(eventKey as typeof sortType)}
        >
          <Dropdown.Item eventKey="name">Sort by name</Dropdown.Item>
          <Dropdown.Item eventKey="modified">Sort by last modified</Dropdown.Item>
        </PopoverDropdown>

        <IconButton
          icon={<Icon icon="refresh" />}
          appearance="subtle"
          loading={isGettingNotebooks || isGettingWorkshops}
          onClick={() => {
            !isGettingNotebooks && dispatchGetNotebooks();
            !isGettingWorkshops && dispatchGetWorkshops();
          }}
        />
      </div>

      <Divider>
        <span className={css(styles.dividerText)}>Notebooks</span>
      </Divider>

      {notebooks
        .filter(filterNotebookByName(filterValue))
        .sort(sortNotebookBy(sortType))
        .valueSeq()
        .map((project) => {
          const active = project.nb_id === notebook?.nb_id;

          return (
            <ProjectButton
              key={project.nb_id}
              icon={active ? 'file' : 'file-o'}
              name={project.name}
              active={active}
              time_modified={project.time_modified}
              loading={project.nb_id === openingNotebookId}
              disabled={false}
              onClick={() => !isOpeningNotebook && !active && dispatchOpenNotebook(project.nb_id)}
            />
          );
        })}

      {notebooks.size === 0 && (
        <p className={css(styles.descriptionText)}>
          You have no notebooks. Notebooks you created or are shared with you will appear here.
        </p>
      )}

      <Divider>
        <span className={css(styles.dividerText)}>Workshops</span>
      </Divider>

      {workshops
        .filter(filterNotebookByName(filterValue))
        .sort(sortNotebookBy(sortType))
        .valueSeq()
        .map((project) => {
          const active = project.main_notebook.nb_id === notebook?.nb_id;
          const isInstructor = project.instructors.findIndex((instructor) => instructor.uid === user?.uid) >= 0;

          return (
            <ProjectButton
              key={project.ws_id}
              icon={active ? 'file' : 'file-o'}
              name={project.name}
              active={active}
              time_modified={project.main_notebook.time_modified}
              loading={project.main_notebook.nb_id === openingNotebookId}
              disabled={!isInstructor && !project.start_time}
              onClick={() => !isOpeningNotebook && !active && dispatchOpenNotebook(project.main_notebook.nb_id)}
            />
          );
        })}

      {workshops.size === 0 && (
        <p className={css(styles.descriptionText)}>
          You have no workshops. To run a workshop, create a new project and select workshop. If you are an attendee,
          the workshop will appear here once it is released!
        </p>
      )}

      <Modal
        size="xs"
        autoFocus
        show={showCreateProject}
        onHide={() => !isCreatingNotebook && setShowCreateProject(false)}
      >
        <Modal.Header>
          <Modal.Title>New {newProjectType} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            ref={newProjectFormRef}
            autoComplete="off"
            fluid
            checkTrigger="none"
            model={newProjectModel}
            formValue={newProjectFormValue}
            onChange={(formValue) => setNewProjectFormValue(formValue as NewProjectFormValue)}
            onSubmit={handleNewProjectFormSubmit}
          >
            <FormGroup>
              <ControlLabel>
                Project name <span className={css(styles.requiredText)}>Required</span>
              </ControlLabel>
              <FormControl name="name" label="Project Name" placeholder="Project Name" />
              <HelpBlock>
                This will be the name of your new {newProjectType} as it will appear in the project list
              </HelpBlock>
            </FormGroup>

            {newProjectType === 'Workshop' && (
              <FormGroup>
                <ControlLabel>Project description</ControlLabel>
                <FormControl
                  name="description"
                  label="Project Description"
                  placeholder="Project Description"
                  componentClass="textarea"
                  rows={3}
                />
                <HelpBlock>
                  This will be the description of your new workshop, for instance "Learn the fundamentals of data
                  science with real world examples"
                </HelpBlock>
              </FormGroup>
            )}
          </Form>

          <Divider />

          <ControlLabel>Project content</ControlLabel>
          <Uploader
            accept=".ipynb,.json,application/json"
            draggable
            autoUpload={false}
            multiple={false}
            fileList={uploadedFileList}
            disabled={uploadedFileList.length > 0}
            onChange={handleUploadFile}
          >
            <div style={{ lineHeight: '64px' }}>Click or Drag a notebook to this area to upload</div>
          </Uploader>
          <HelpBlock>You can create a blank project or upload an existing notebook to start from</HelpBlock>
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="subtle" disabled={isCreatingNotebook} onClick={() => setShowCreateProject(false)}>
            Cancel
          </Button>
          <Button
            appearance="primary"
            loading={isCreatingNotebook}
            onClick={newProjectType === 'Notebook' ? dispatchCreateNotebook : dispatchCreateWorkshop}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default ProjectsPanel;
