import React from 'react';
import { Placeholder } from 'rsuite';
import { StyleSheet, css } from 'aphrodite';

import AceImports from '../../utils/AceImports';
import { palette, spacing } from '../../constants/theme';
import useKernel from '../../kernel/useKernel';

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
  const kernel = useKernel();

  return (
    <React.Fragment>
      {AceImports}

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
    </React.Fragment>
  );
};

export default EditorPage;
