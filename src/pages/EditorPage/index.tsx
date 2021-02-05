import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Placeholder } from 'rsuite';

import { palette, spacing } from '../../constants/theme';

import EditorHeader from './EditorHeader';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  page: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  editableAreaContainer: {
    display: 'flex',
    flex: 1,
    backgroundColor: palette.BASE,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  editableArea: {
    flex: 1,
    padding: spacing.DEFAULT,
    overflowY: 'auto',
  },
});

const EditorPage: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <EditorHeader />

      <div className={css(styles.page)}>
        <LeftSidebar />

        <div className={css(styles.editableAreaContainer)}>
          <div className={css(styles.editableArea)}>
            <Placeholder.Paragraph rows={30} active />
          </div>
        </div>

        <RightSidebar />
      </div>
    </div>
  );
};

export default EditorPage;
