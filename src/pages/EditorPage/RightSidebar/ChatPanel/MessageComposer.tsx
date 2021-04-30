import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Form, FormControl, FormGroup, Icon, Schema } from 'rsuite';
import { FormInstance } from 'rsuite/lib/Form';

import { palette, spacing } from '../../../../constants/theme';
import { ReduxState } from '../../../../types/redux';
import { _editor } from '../../../../redux/actions';

const styles = StyleSheet.create({
  composeContainer: {
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: palette.BASE_BORDER,
    paddingTop: spacing.DEFAULT,
  },
  sendButton: {
    marginTop: spacing.DEFAULT / 2,
  },
  sendText: {
    marginLeft: spacing.DEFAULT / 2,
  },
});

type MessageFormValue = {
  message: string;
};

/**
 * The rsuite model to check if a message is valid
 */
const messageFormModel = Schema.Model({
  message: Schema.Types.StringType()
    .maxLength(256, "Message can't be longer than 256 characters!")
    .isRequired("Can't send an empty message!"),
});

/**
 * Form where the user composes their message
 */
const MessageComposer: React.FC = () => {
  const messageFormRef = React.useRef<FormInstance>();

  const notebookUsers = useSelector((state: ReduxState) => state.editor.notebook?.users);
  const isSendingMessage = useSelector((state: ReduxState) => state.editor.isSendingMessage);

  const [messageFormValue, setMessageFormValue] = React.useState<MessageFormValue>({
    message: '',
  });

  const dispatch = useDispatch();
  const dispatchSendMessage = React.useCallback((message: string) => dispatch(_editor.sendMessage(message)), [
    dispatch,
  ]);

  const handleMessageFormSubmit = React.useCallback(
    (_?: any, event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!messageFormRef.current?.check()) {
        return;
      }

      dispatchSendMessage(messageFormValue.message);
      setMessageFormValue((prevMessageFormValue) => ({
        ...prevMessageFormValue,
        message: '',
      }));
    },
    [dispatchSendMessage, messageFormValue.message]
  );

  return (
    <div className={css(styles.composeContainer)}>
      <Form
        ref={messageFormRef}
        autoComplete="off"
        fluid
        checkTrigger="none"
        model={messageFormModel}
        formValue={messageFormValue}
        onChange={(formValue) => setMessageFormValue(formValue as MessageFormValue)}
        onSubmit={handleMessageFormSubmit}
      >
        <FormGroup>
          <FormControl name="message" label="Message" placeholder="Your message" />
        </FormGroup>
      </Form>

      <Button
        className={css(styles.sendButton)}
        appearance="primary"
        block
        loading={isSendingMessage}
        disabled={!notebookUsers}
        onClick={handleMessageFormSubmit}
      >
        <Icon icon="send-o" />
        <span className={css(styles.sendText)}>Send</span>
      </Button>
    </div>
  );
};

export default MessageComposer;
