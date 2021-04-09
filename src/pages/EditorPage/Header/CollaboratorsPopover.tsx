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
  Icon,
  List,
  Popover,
  Radio,
  RadioGroup,
  Schema,
  Whisper,
} from 'rsuite';
import { FormInstance } from 'rsuite/lib/Form';
import { NotebookAccessLevelType } from '@actually-colab/editor-types';

import { palette, spacing } from '../../../constants/theme';
import { RIGHT_SIDEBAR_PANEL_WIDTH } from '../../../constants/dimensions';
import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';
import { UserAvatar } from '../../../components';

type ShareFormValue = {
  email: string;
  accessLevel: NotebookAccessLevelType;
};

/**
 * The rsuite model to check if a collaborator form is valid
 */
const shareFormModel = Schema.Model({
  email: Schema.Types.StringType().isEmail('Not a valid email').isRequired('This field is required'),
  accessLevel: Schema.Types.StringType()
    .isOneOf(['Read Only', 'Full Access'], 'Please select a valid option')
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
    marginLeft: spacing.DEFAULT / 4,
    fontSize: 16,
  },
  shareTextSmall: {
    marginLeft: spacing.DEFAULT / 4,
  },
  userListContainer: {
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

  const notebook = useSelector((state: ReduxState) => state.editor.notebook);
  const isSharingNotebook = useSelector((state: ReduxState) => state.editor.isSharingNotebook);

  const [shareFormValue, setShareFormValue] = React.useState<ShareFormValue>({
    email: '',
    accessLevel: 'Full Access',
  });

  const sharedUsers = React.useMemo(() => notebook?.users, [notebook?.users]);

  const dispatch = useDispatch();
  const dispatchShareNotebook = React.useCallback(
    () =>
      shareFormRef.current?.check() &&
      notebook &&
      dispatch(_editor.shareNotebook(notebook?.nb_id, shareFormValue.email, shareFormValue.accessLevel)),
    [dispatch, notebook, shareFormValue.accessLevel, shareFormValue.email]
  );

  const handleShareFormSubmit = React.useCallback(
    (_, event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      dispatchShareNotebook();
      setShareFormValue((prevShareFormValue) => ({
        ...prevShareFormValue,
        email: '',
      }));
    },
    [dispatchShareNotebook]
  );

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.shareForm)}>
        <Form
          ref={shareFormRef}
          autoComplete="off"
          fluid
          checkTrigger="none"
          model={shareFormModel}
          formValue={shareFormValue}
          onChange={(formValue) => setShareFormValue(formValue as ShareFormValue)}
          onSubmit={handleShareFormSubmit}
        >
          <FormGroup>
            <ControlLabel>
              Collaborator's email <span className={css(styles.required)}>Required</span>
            </ControlLabel>
            <FormControl name="email" label="Email" placeholder="Email" />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Access level</ControlLabel>
            <FormControl className={css(styles.fullPicker)} name="accessLevel" accepter={RadioGroup}>
              <Radio value="Read Only">Read only</Radio>
              <Radio value="Full Access">Full access</Radio>
            </FormControl>
          </FormGroup>
        </Form>

        <Button
          className={css(styles.shareButton)}
          appearance="primary"
          block
          loading={isSharingNotebook}
          onClick={dispatchShareNotebook}
        >
          <Icon icon="share" size="lg" />
          <span className={css(styles.shareText)}>Share</span>
        </Button>
      </div>

      <div className={css(styles.userListContainer)}>
        <h6>Shared with:</h6>

        <List className={css(styles.userList)}>
          {sharedUsers?.map((item, index) => (
            <List.Item className={css(styles.userItem)} key={item.uid} index={index}>
              <FlexboxGrid align="middle">
                <FlexboxGrid.Item colspan={4}>
                  <UserAvatar user={item} hover={false} />
                </FlexboxGrid.Item>

                <FlexboxGrid.Item colspan={18}>
                  <div className={css(styles.userItemLabel)}>
                    <div className={css(styles.userItemEmail)}>{item.email}</div>
                    <div className={css(styles.userItemName)}>{item.name}</div>
                  </div>
                </FlexboxGrid.Item>

                <FlexboxGrid.Item colspan={2}>
                  <Icon
                    className={css(
                      styles.accessLevelIcon,
                      item.access_level === 'Read Only' && styles.accessLevelIconDisabled
                    )}
                    icon="pencil"
                    size="lg"
                  />
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </List.Item>
          ))}
        </List>
      </div>
    </div>
  );
};

/**
 * The full button and popover for the collaborators component
 */
const CollaboratorsPopover: React.FC = () => {
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
      <Button appearance="primary" size="sm">
        <Icon icon="share" />
        <span className={css(styles.shareTextSmall)}>Share</span>
      </Button>
    </Whisper>
  );
};

export default CollaboratorsPopover;
