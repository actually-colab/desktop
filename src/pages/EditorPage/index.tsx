import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import AceImports from '../../utils/AceImports';
import { palette, spacing } from '../../constants/theme';
import { ReduxState } from '../../redux';
import useKernel from '../../kernel/useKernel';
import { NotebookCell } from '../../components';

import { EditorHeader, LeftSidebar, RightSidebar } from './components';

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

/**
 * The editor page
 */
const EditorPage: React.FC = () => {
  // Include the kernel manager once
  useKernel();

  const cells = useSelector((state: ReduxState) => state.editor.cells);

  return (
    <div className={css(styles.container)}>
      <EditorHeader />

      <div className={css(styles.page)}>
        <LeftSidebar />

        <div className={css(styles.editableAreaContainer)}>
          <div className={css(styles.editableArea)}>
            {cells.map((cell) => (
              <NotebookCell key={cell.cell_id} cell={cell} />
            ))}
          </div>
        </div>

        <RightSidebar />
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
