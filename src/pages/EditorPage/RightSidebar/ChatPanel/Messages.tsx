import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Map as ImmutableMap } from 'immutable';
import { format } from 'date-fns';
import { DUser } from '@actually-colab/editor-types';

import { palette, spacing } from '../../../../constants/theme';
import { ReduxState } from '../../../../types/redux';

const styles = StyleSheet.create({
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
});

/**
 * The Chat panel for the right sidebar
 */
const Messages: React.FC = () => {
  const uid = useSelector((state: ReduxState) => state.auth.user?.uid);
  const notebookUsers = useSelector((state: ReduxState) => state.editor.notebook?.users);
  const messages = useSelector((state: ReduxState) => state.editor.messages);

  const userLookup = React.useMemo(
    () =>
      ImmutableMap<DUser['uid'], string>().withMutations((mtx) =>
        notebookUsers?.forEach((user) => mtx.set(user.uid, user.name))
      ),
    [notebookUsers]
  );

  return (
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
  );
};

export default Messages;
