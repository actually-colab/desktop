import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import { ReduxState } from '../../../types/redux';
import { spacing } from '../../../constants/theme';
import ContainerContext from '../../../contexts/ContainerContext';
import { NotebookCell } from '../../../components';

const styles = StyleSheet.create({
  body: {
    position: 'relative',
    flex: 1,
    padding: spacing.DEFAULT,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
});

/**
 * The body of the editor page
 */
const EditorBody: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const cell_ids = useSelector((state: ReduxState) => state.editor.notebook?.cell_ids);

  return (
    <div ref={containerRef} className={css(styles.body)}>
      <ContainerContext.Provider value={{ container: containerRef.current ?? undefined }}>
        {cell_ids?.map((cell_id) => (
          <NotebookCell key={cell_id} cell_id={cell_id} />
        ))}
      </ContainerContext.Provider>
    </div>
  );
};

export default EditorBody;
