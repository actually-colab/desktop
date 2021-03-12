import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import AceImports from '../../utils/AceImports';
import { palette, spacing } from '../../constants/theme';
import { HEADER_HEIGHT, RIGHT_SIDEBAR_TRAY_WIDTH } from '../../constants/dimensions';
import { ReduxState } from '../../types/redux';
import useKernel from '../../kernel/useKernel';
import { NotebookCell } from '../../components';

import { EditorHeader, LeftSidebar, RightSidebar } from './components';
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
    overflow: 'hidden',
  },
  bodyContainer: {
    marginRight: RIGHT_SIDEBAR_TRAY_WIDTH,
    display: 'flex',
    flex: 1,
    backgroundColor: palette.BASE,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    padding: spacing.DEFAULT,
    overflowY: 'auto',
  },
  rightContainer: {
    marginTop: HEADER_HEIGHT,
    display: 'flex',
  },
});

/**
 * The editor page
 */
const EditorPage: React.FC = () => {
  // Include the kernel manager once
  useKernel();
  // Include the notebooks
  useNotebooks();

  const notebook = useSelector((state: ReduxState) => state.editor.notebook);

  return (
    <div className={css(styles.container)}>
      <LeftSidebar />

      <div className={css(styles.pageContainer)}>
        <EditorHeader />

        <div className={css(styles.page)}>
          <div className={css(styles.bodyContainer)}>
            <div className={css(styles.body)}>
              {notebook.get('cell_ids').map((cell_id) => (
                <NotebookCell key={cell_id} cell_id={cell_id} />
              ))}
            </div>
          </div>

          <div className={css(styles.rightContainer)}>
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * The editor page with the Ace Imports included
 */
const EditorPageWithImports: React.FC = () => {
  return (
    <React.Fragment>
      {AceImports}

      <EditorPage />
    </React.Fragment>
  );
};

export default EditorPageWithImports;
