import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import {
  Button,
  ControlLabel,
  FlexboxGrid,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
  Icon,
  IconButton,
  List,
  Popover,
  Radio,
  RadioGroup,
  Schema,
  Whisper,
} from 'rsuite';
import { FormInstance } from 'rsuite/lib/Form';
import { NotebookAccessLevelType, WorkshopAccessLevelType } from '@actually-colab/editor-types';

import { palette, spacing } from '../../../constants/theme';
import { RIGHT_SIDEBAR_PANEL_WIDTH } from '../../../constants/dimensions';
import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';
import { EMAILS_REGEX } from '../../../utils/regex';
import { UserAvatar } from '../../../components';

type ShareNotebookFormValue = {
  emails: string;
  accessLevel: NotebookAccessLevelType;
};

type ShareWorkshopFormValue = {
  emails: string;
  accessLevel: WorkshopAccessLevelType;
};

/**
 * The rsuite model to check if a collaborator form is valid for notebooks
 */
const shareNotebookFormModel = Schema.Model({
  emails: Schema.Types.StringType()
    .pattern(EMAILS_REGEX, 'Must be a comma separated list of emails')
    .isRequired('This field is required'),
  accessLevel: Schema.Types.StringType()
    .isOneOf(['Read Only', 'Full Access'], 'Please select a valid option')
    .isRequired('This field is required'),
});

/**
 * The rsuite model to check if a collaborator form is valid for workshops
 */
const shareWorkshopFormModel = Schema.Model({
  emails: Schema.Types.StringType()
    .pattern(EMAILS_REGEX, 'Must be a comma separated list of emails')
    .isRequired('This field is required'),
  accessLevel: Schema.Types.StringType()
    .isOneOf(['Instructor', 'Attendee'], 'Please select a valid option')
    .isRequired('This field is required'),
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: spacing.DEFAULT,
  },
  shareForm: {
    padding: spacing.DEFAULT,
    backgroundColor: palette.BASE,
    borderColor: palette.BASE_BORDER,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 6,
  },
  required: {
    marginLeft: spacing.DEFAULT / 2,
    color: palette.ERROR,
  },
  fullPicker: {
    display: 'inline-block',
    width: '100%',
  },
  shareButton: {
    marginTop: spacing.DEFAULT / 2,
  },
  shareText: {
    marginLeft: spacing.DEFAULT / 2,
    fontSize: 16,
  },
  shareTextSmall: {
    marginLeft: spacing.DEFAULT / 4,
  },
  userListContainer: {
    marginTop: spacing.DEFAULT,
  },
  secondaryListTitle: {
    marginTop: spacing.DEFAULT,
  },
  userList: {
    marginTop: spacing.DEFAULT / 2,
    maxHeight: 300,
  },
  userItem: {},
  userItemLabel: {},
  userItemEmail: {
    color: palette.GRAY,
  },
  userItemName: {},
  accessLevelIcon: {
    color: palette.GRAY,
  },
  accessLevelIconDisabled: {
    opacity: 0.3,
  },
});

/**
 * The Collaborators panel for the editor header
 */
const CollaboratorsPanel: React.FC = () => {
  const shareFormRef = React.useRef<FormInstance>();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const notebook = useSelector((state: ReduxState) => state.editor.notebook);
  const workshops = useSelector((state: ReduxState) => state.editor.workshops);
  const isSharingNotebook = useSelector((state: ReduxState) => state.editor.isSharingNotebook);
  const isUnsharingNotebook = useSelector((state: ReduxState) => state.editor.isUnsharingNotebook);
  const isReleasingWorkshop = useSelector((state: ReduxState) => state.editor.isReleasingWorkshop);

  const [shareNotebookFormValue, setShareNotebookFormValue] = React.useState<ShareNotebookFormValue>({
    emails: '',
    accessLevel: 'Full Access',
  });
  const [shareWorkshopFormValue, setShareWorkshopFormValue] = React.useState<ShareWorkshopFormValue>({
    emails: '',
    accessLevel: 'Instructor',
  });

  const workshop = React.useMemo(() => workshops.get(notebook?.ws_id ?? '') ?? null, [notebook?.ws_id, workshops]);
  const accessLevel = React.useMemo(
    () =>
      workshop?.instructors !== undefined
        ? workshop.instructors.find((_user) => _user.uid === user?.uid)
        : notebook?.users.find((_user) => _user.uid === user?.uid),
    [notebook?.users, user?.uid, workshop?.instructors]
  );
  const canEdit = React.useMemo(
    () => accessLevel?.access_level === 'Full Access' || accessLevel?.access_level === 'Instructor',
    [accessLevel?.access_level]
  );
  const sharedUsers = React.useMemo(() => notebook?.users, [notebook?.users]);
  const sharedInstructors = React.useMemo(() => workshop?.instructors, [workshop?.instructors]);
  const sharedAttendees = React.useMemo(() => workshop?.attendees, [workshop?.attendees]);

  const dispatch = useDispatch();
  const dispatchShareNotebook = React.useCallback(
    () =>
      notebook?.nb_id &&
      dispatch(
        _editor.shareNotebook(notebook.nb_id, shareNotebookFormValue.emails, shareNotebookFormValue.accessLevel)
      ),
    [dispatch, notebook?.nb_id, shareNotebookFormValue.accessLevel, shareNotebookFormValue.emails]
  );
  const dispatchShareWorkshop = React.useCallback(
    () =>
      workshop &&
      dispatch(
        _editor.shareWorkshop(workshop.ws_id, shareWorkshopFormValue.emails, shareWorkshopFormValue.accessLevel)
      ),
    [dispatch, shareWorkshopFormValue.accessLevel, shareWorkshopFormValue.emails, workshop]
  );
  const dispatchUnshareNotebook = React.useCallback(
    (email: string) => notebook?.nb_id && dispatch(_editor.unshareNotebook(notebook.nb_id, email)),
    [dispatch, notebook?.nb_id]
  );
  const dispatchReleaseWorkshop = React.useCallback(
    () => workshop?.ws_id && dispatch(_editor.releaseWorkshop(workshop.ws_id)),
    [dispatch, workshop?.ws_id]
  );

  const handleShareFormSubmit = React.useCallback(
    (_?: any, event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!shareFormRef.current?.check()) {
        return;
      }

      if (workshop) {
        dispatchShareWorkshop();
        setShareWorkshopFormValue((prevShareFormValue) => ({
          ...prevShareFormValue,
          emails: '',
        }));
      } else {
        dispatchShareNotebook();
        setShareNotebookFormValue((prevShareFormValue) => ({
          ...prevShareFormValue,
          emails: '',
        }));
      }
    },
    [dispatchShareNotebook, dispatchShareWorkshop, workshop]
  );

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.shareForm)}>
        {canEdit ? (
          <React.Fragment>
            <Form
              ref={shareFormRef}
              autoComplete="off"
              fluid
              checkTrigger="none"
              model={workshop ? shareWorkshopFormModel : shareNotebookFormModel}
              formValue={workshop ? shareWorkshopFormValue : shareNotebookFormValue}
              onChange={(formValue) =>
                workshop
                  ? setShareWorkshopFormValue(formValue as ShareWorkshopFormValue)
                  : setShareNotebookFormValue(formValue as ShareNotebookFormValue)
              }
              onSubmit={handleShareFormSubmit}
            >
              <FormGroup>
                <ControlLabel>
                  Collaborator email(s) <span className={css(styles.required)}>Required</span>
                </ControlLabel>
                <FormControl name="emails" label="Email(s)" placeholder="Email(s)" />
                <HelpBlock>This can be a comma separated list of emails</HelpBlock>
              </FormGroup>

              {workshop === null ? (
                <FormGroup>
                  <ControlLabel>Access level</ControlLabel>
                  <FormControl className={css(styles.fullPicker)} name="accessLevel" accepter={RadioGroup}>
                    <Radio value="Full Access">Full access</Radio>
                    <Radio value="Read Only">Read only</Radio>
                  </FormControl>
                </FormGroup>
              ) : (
                <FormGroup>
                  <ControlLabel>Access level</ControlLabel>
                  <FormControl className={css(styles.fullPicker)} name="accessLevel" accepter={RadioGroup}>
                    <Radio value="Instructor">Instructor</Radio>
                    <Radio value="Attendee">Attendee</Radio>
                  </FormControl>
                </FormGroup>
              )}
            </Form>

            <Button
              className={css(styles.shareButton)}
              appearance="primary"
              block
              loading={isSharingNotebook}
              onClick={handleShareFormSubmit}
            >
              <Icon icon="share-square-o" size="lg" />
              <span className={css(styles.shareText)}>Share</span>
            </Button>
          </React.Fragment>
        ) : (
          <p>Only collaborators with full access can share this notebook!</p>
        )}
      </div>

      <div className={css(styles.userListContainer)}>
        {workshop === null ? (
          <React.Fragment>
            <h6>Shared with:</h6>

            <List className={css(styles.userList)}>
              {sharedUsers?.map((item, index) => (
                <List.Item className={css(styles.userItem)} key={item.uid} index={index}>
                  <FlexboxGrid align="middle">
                    <FlexboxGrid.Item colspan={4}>
                      <UserAvatar user={item} hover={false} />
                    </FlexboxGrid.Item>

                    <FlexboxGrid.Item colspan={16}>
                      <div className={css(styles.userItemLabel)}>
                        <div className={css(styles.userItemEmail)}>
                          {item.uid === user?.uid ? `${item.email} (you)` : item.email}
                        </div>
                        <div className={css(styles.userItemName)}>{item.name}</div>
                      </div>
                    </FlexboxGrid.Item>

                    <FlexboxGrid.Item colspan={canEdit ? 2 : 4}>
                      <Icon
                        className={css(styles.accessLevelIcon)}
                        icon={item.access_level === 'Full Access' ? 'pencil' : 'eye'}
                        size="lg"
                      />
                    </FlexboxGrid.Item>

                    {canEdit && (
                      <FlexboxGrid.Item colspan={2}>
                        <IconButton
                          size="xs"
                          appearance="subtle"
                          icon={<Icon icon="close" />}
                          loading={isUnsharingNotebook}
                          disabled={item.uid === user?.uid}
                          onClick={() => dispatchUnshareNotebook(item.email)}
                        />
                      </FlexboxGrid.Item>
                    )}
                  </FlexboxGrid>
                </List.Item>
              ))}
            </List>

            {!sharedUsers?.size && <p>No collaborators</p>}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <h6>Instructors:</h6>

            <List className={css(styles.userList)}>
              {sharedInstructors?.map((item, index) => (
                <List.Item className={css(styles.userItem)} key={item.uid} index={index}>
                  <FlexboxGrid align="middle">
                    <FlexboxGrid.Item colspan={4}>
                      <UserAvatar user={item} hover={false} />
                    </FlexboxGrid.Item>

                    <FlexboxGrid.Item colspan={20}>
                      <div className={css(styles.userItemLabel)}>
                        <div className={css(styles.userItemEmail)}>
                          {item.uid === user?.uid ? `${item.email} (you)` : item.email}
                        </div>
                        <div className={css(styles.userItemName)}>{item.name}</div>
                      </div>
                    </FlexboxGrid.Item>
                  </FlexboxGrid>
                </List.Item>
              ))}
            </List>

            {!sharedInstructors?.size && <p>No instructors</p>}

            <h6 className={css(styles.secondaryListTitle)}>Attendees:</h6>

            <List className={css(styles.userList)}>
              {sharedAttendees?.map((item, index) => (
                <List.Item className={css(styles.userItem)} key={item.uid} index={index}>
                  <FlexboxGrid align="middle">
                    <FlexboxGrid.Item colspan={4}>
                      <UserAvatar user={item} hover={false} />
                    </FlexboxGrid.Item>

                    <FlexboxGrid.Item colspan={20}>
                      <div className={css(styles.userItemLabel)}>
                        <div className={css(styles.userItemEmail)}>
                          {item.uid === user?.uid ? `${item.email} (you)` : item.email}
                        </div>
                        <div className={css(styles.userItemName)}>{item.name}</div>
                      </div>
                    </FlexboxGrid.Item>
                  </FlexboxGrid>
                </List.Item>
              ))}
            </List>

            {!sharedAttendees?.size && <p>No attendees</p>}

            {canEdit && (
              <React.Fragment>
                <Button
                  className={css(styles.shareButton)}
                  appearance="primary"
                  block
                  loading={isReleasingWorkshop}
                  disabled={!sharedAttendees?.size || !!workshop.start_time}
                  onClick={dispatchReleaseWorkshop}
                >
                  <Icon icon="envelope-open-o" size="lg" />
                  <span className={css(styles.shareText)}>{workshop.start_time ? 'Released' : 'Release'}</span>
                </Button>

                <p>Releasing the workshop will open it up for attendees</p>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

/**
 * The full button and popover for the collaborators component
 */
const CollaboratorsPopover: React.FC = () => {
  const notebook = useSelector((state: ReduxState) => state.editor.notebook);

  return (
    <Whisper
      trigger="click"
      placement="bottomEnd"
      speaker={
        <Popover full style={{ border: '1px solid #ddd', width: RIGHT_SIDEBAR_PANEL_WIDTH }}>
          <CollaboratorsPanel />
        </Popover>
      }
    >
      <Button appearance="primary" size="sm" disabled={notebook === null}>
        <Icon icon="share-square-o" />
        <span className={css(styles.shareTextSmall)}>Share</span>
      </Button>
    </Whisper>
  );
};

export default CollaboratorsPopover;
