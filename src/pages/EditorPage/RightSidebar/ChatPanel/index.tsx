import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import Messages from './Messages';
import MessageComposer from './MessageComposer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    overflowY: 'hidden',
  },
});

/**
 * The Chat panel for the right sidebar
 */
const ChatPanel: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <Messages />
      <MessageComposer />
    </div>
  );
};

export default ChatPanel;
