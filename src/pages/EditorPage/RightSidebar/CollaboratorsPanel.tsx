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
  Radio,
  RadioGroup,
  Schema,
} from 'rsuite';
import { FormInstance } from 'rsuite/lib/Form';
import { NotebookAccessLevelType } from '@actually-colab/editor-types';

import { palette, spacing } from '../../../constants/theme';
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
  userListContainer: {
    marginTop: spacing.DEFAULT,
  },
  userList: {
    marginTop: spacing.DEFAULT / 2,
  },
  userItem: {
    backgroundColor: palette.BASE_FADED,
  },
  userItemLabel: {},
  userItemEmail: {
    color: palette.GRAY,
  },
  userItemName: {},
  accessLevelIcon: {
    color: palette.GRAY,
  },
  accessLevelIconDisabled: {
    opacity: 0.5,
  },
});

/**
 * The Collaborators panel for the right sidebar
 */
const CollaboratorsPanel: React.FC = () => {
  const shareFormRef = React.useRef<FormInstance>();

  const notebook = useSelector((state: ReduxState) => state.editor.notebook);
  const isSharingNotebook = useSelector((state: ReduxState) => state.editor.isSharingNotebook);

  const [shareFormValue, setShareFormValue] = React.useState<ShareFormValue>({
    email: '',
    accessLevel: 'Read Only',
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
    },
    [dispatchShareNotebook]
  );

  return (
    <div>
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

export default CollaboratorsPanel;
