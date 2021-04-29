import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import { ReduxState } from '../../../types/redux';
import { spacing } from '../../../constants/theme';
import { NotebookCell } from '../../../components';

const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: spacing.DEFAULT,
    overflowY: 'auto',
  },
});

/**
 * The body of the editor page
 */
const EditorBody: React.FC = () => {
  const cell_ids = useSelector((state: ReduxState) => state.editor.notebook?.cell_ids);

  return (
    <div className={css(styles.body)}>
      {cell_ids?.map((cell_id) => (
        <NotebookCell key={cell_id} cell_id={cell_id} />
      ))}
    </div>
  );
};

export default EditorBody;
