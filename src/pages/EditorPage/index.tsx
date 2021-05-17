import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { palette } from '../../constants/theme';
import useKernel from '../../kernel/useKernel';

import { EditorBody, EditorHeader, LeftSidebar, RightSidebar } from './components';
import useNotebooks from './hooks/useNotebooks';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  page: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  bodyContainer: {
    display: 'flex',
    flex: 1,
    backgroundColor: palette.BASE,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  rightContainer: {
    display: 'flex',
  },
});

/**
 * Attach high level helpers that shouldn't trigger re-renders
 */
const Helpers: React.FC = () => {
  // Include the kernel manager once
  useKernel();
  // Include the notebooks
  useNotebooks();

  return null;
};

/**
 * The editor page
 */
const EditorPage: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <Helpers />
      <LeftSidebar />

      <div className={css(styles.pageContainer)}>
        <EditorHeader />

        <div className={css(styles.page)}>
          <div className={css(styles.bodyContainer)}>
            <EditorBody />
          </div>

          <div className={css(styles.rightContainer)}>
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
