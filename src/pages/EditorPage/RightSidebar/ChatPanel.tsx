import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Form, FormControl, FormGroup, Icon, Schema } from 'rsuite';
import { FormInstance } from 'rsuite/lib/Form';
import { Map as ImmutableMap } from 'immutable';
import { format } from 'date-fns';
import { DUser } from '@actually-colab/editor-types';

import { palette, spacing } from '../../../constants/theme';
import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    overflowY: 'hidden',
  },
  messagesContainer: {
    flexBasis: '20px',
    flexGrow: 1,
    flexShrink: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column-reverse',
  },
  messagesScrollContainer: {},
  messageBubble: {
    marginBottom: spacing.DEFAULT,
    marginLeft: 0,
    marginRight: spacing.DEFAULT * 2,
    ...spacing.pad({ right: spacing.DEFAULT / 2 }),
    borderRadius: 12,
    backgroundColor: palette.CHARCOAL,
    color: palette.BASE,
  },
  messageBubbleSelf: {
    marginLeft: spacing.DEFAULT * 2,
    marginRight: 0,
    backgroundColor: palette.PRIMARY,
  },
  timestamp: {
    fontSize: 12,
  },
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
 * The Chat panel for the right sidebar
 */
const ChatPanel: React.FC = () => {
  const messageFormRef = React.useRef<FormInstance>();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const notebook = useSelector((state: ReduxState) => state.editor.notebook);
  const isSendingMessage = useSelector((state: ReduxState) => state.editor.isSendingMessage);
  const messages = useSelector((state: ReduxState) => state.editor.messages);

  const [messageFormValue, setMessageFormValue] = React.useState<MessageFormValue>({
    message: '',
  });

  const uid = React.useMemo(() => user?.uid ?? '', [user?.uid]);
  const userLookup = React.useMemo(
    () =>
      ImmutableMap<DUser['uid'], string>().withMutations((mtx) =>
        notebook?.users?.forEach((user) => mtx.set(user.uid, user.name))
      ),
    [notebook?.users]
  );

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
    <div className={css(styles.container)}>
      <div className={css(styles.messagesContainer)}>
        <div className={css(styles.messagesScrollContainer)}>
          {messages.map((message) => (
            <div
              key={`${message.uid}-${message.timestamp}`}
              className={css(styles.messageBubble, message.uid === uid && styles.messageBubbleSelf)}
            >
              <h6>{userLookup.get(message.uid) ?? 'Unknown'}</h6>
              <p className={css(styles.timestamp)}>{format(message.timestamp, 'pp')}</p>

              <p>{message.message}</p>
            </div>
          ))}
        </div>
      </div>

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
          disabled={notebook === null}
          onClick={handleMessageFormSubmit}
        >
          <Icon icon="send-o" />
          <span className={css(styles.sendText)}>Send</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatPanel;
