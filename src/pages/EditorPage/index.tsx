import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import EditorSidebar from './EditorSidebar';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
  },
});

const EditorPage: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <EditorSidebar />
    </div>
  );
};

export default EditorPage;
