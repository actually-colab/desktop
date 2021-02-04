import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import EditorSidebar from './EditorSidebar';
import { palette } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
  },
  editableAreaContainer: {
    display: 'flex',
    flex: 1,
    backgroundColor: palette.BASE,
  },
});

const EditorPage: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <EditorSidebar />

      <div className={css(styles.editableAreaContainer)} />
    </div>
  );
};

export default EditorPage;
