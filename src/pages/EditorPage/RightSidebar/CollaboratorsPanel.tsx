import React from 'react';
import { useDispatch } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Icon,
  Radio,
  RadioGroup,
  Schema,
  SelectPicker,
} from 'rsuite';
import { FormInstance } from 'rsuite/lib/Form';
import { NotebookAccessLevelType } from '@actually-colab/editor-types';

import { palette, spacing } from '../../../constants/theme';

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
});

/**
 * The Collaborators panel for the right sidebar
 */
const CollaboratorsPanel: React.FC = () => {
  const shareFormRef = React.useRef<FormInstance>();

  const [shareFormValue, setShareFormValue] = React.useState<ShareFormValue>({
    email: '',
    accessLevel: 'Read Only',
  });

  const dispatch = useDispatch();
  const dispatchShareNotebook = React.useCallback(() => shareFormRef.current?.check(), []);

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

        <Button className={css(styles.shareButton)} appearance="primary" block onClick={dispatchShareNotebook}>
          <Icon icon="share" size="lg" />
          <span className={css(styles.shareText)}>Share</span>
        </Button>
      </div>
    </div>
  );
};

export default CollaboratorsPanel;
