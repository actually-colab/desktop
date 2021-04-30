import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import { ReduxState } from '../../types/redux';
import { EditorCell } from '../../types/notebook';
import { palette, spacing } from '../../constants/theme';
import RunIndicator from './RunIndicator';
import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';
import CellToolbar from './CellToolbar';
import OutputCell from './OutputCell';

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.DEFAULT,
    paddingRight: spacing.DEFAULT,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.BASE,
    borderLeftStyle: 'solid',
    borderLeftWidth: 3,
    borderLeftColor: palette.BASE,
    opacity: 1,
    'overflow-anchor': 'none',
  },
  containerLocked: {
    borderLeftColor: palette.LIGHT_LAVENDER,
    backgroundColor: palette.BASE_FADED,
    'overflow-anchor': 'auto',
  },
  containerSelected: {
    borderLeftColor: palette.TANGERINE,
  },
  containerAnchored: {
    'overflow-anchor': 'auto',
  },
  content: {
    flex: 1,
    minWidth: 0, // Allow it to be smaller than the content
  },
});

/**
 * The styled container for the cell
 */
const CellContainer: React.FC<{ cell_id: EditorCell['cell_id'] }> = ({ cell_id, children }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const uid = useSelector((state: ReduxState) => state.auth.user?.uid);
  const ownsLock = useSelector(
    (state: ReduxState) => state.editor.cells.get(cell_id)?.lock_held_by === uid,
    shallowEqual
  );
  const ownsNoCells = useSelector(
    (state: ReduxState) => !state.editor.lockedCells.find((lock) => lock.uid === uid),
    shallowEqual
  );
  const isSelected = useSelector((state: ReduxState) => state.editor.selectedCellId === cell_id, shallowEqual);

  /**
   * Auto scroll when cell is selected
   */
  React.useEffect(() => {
    if (isSelected) {
      containerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isSelected]);

  return (
    <div
      ref={containerRef}
      className={css(
        styles.container,
        ownsLock && styles.containerLocked,
        isSelected && styles.containerSelected,
        ownsNoCells && styles.containerAnchored
      )}
    >
      {children}
    </div>
  );
};

/**
 * A component to render all the content for a cell in a notebook including an editor, a toolbar, and cell outputs
 */
const NotebookCell: React.FC<{ cell_id: EditorCell['cell_id'] }> = ({ cell_id }) => {
  return (
    <CellContainer cell_id={cell_id}>
      <React.Fragment>
        <RunIndicator cell_id={cell_id} />

        <div className={css(styles.content)}>
          <CodeCell cell_id={cell_id} />
          <MarkdownCell cell_id={cell_id} />
          <CellToolbar cell_id={cell_id} />
          <OutputCell cell_id={cell_id} />
        </div>
      </React.Fragment>
    </CellContainer>
  );
};

export default NotebookCell;
