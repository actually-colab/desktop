import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import { ReduxState } from '../../types/redux';
import { EditorCell } from '../../types/notebook';

const styles = StyleSheet.create({
  controls: {
    marginTop: -3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  runIndexContainer: {
    width: 64,
    textAlign: 'center',
  },
  runIndex: {
    marginLeft: 4,
    marginRight: 4,
    width: 48,
    textAlign: 'center',
  },
});

/**
 * Indicates the current run index and queue status
 */
const RunIndicator: React.FC<{ cell_id: EditorCell['cell_id'] }> = ({ cell_id }) => {
  const language = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.language);
  const isRunning = useSelector((state: ReduxState) => state.editor.runningCellId === cell_id, shallowEqual);
  const queueIndex = useSelector(
    (state: ReduxState) => state.editor.runQueue.findIndex((next_cell_id) => next_cell_id === cell_id),
    shallowEqual
  );
  const runIndex = useSelector(
    (state: ReduxState) =>
      (state.editor.selectedOutputsUid === ''
        ? state.editor.cells.get(cell_id)?.runIndex
        : state.editor.outputsMetadata.get(cell_id)?.get(state.editor.selectedOutputsUid)?.runIndex) ?? -1,
    shallowEqual
  );

  const isQueued = React.useMemo(() => queueIndex >= 0, [queueIndex]);

  return (
    <div className={css(styles.controls)}>
      <div className={css(styles.runIndexContainer)}>
        {language !== 'markdown' && (
          <React.Fragment>
            <code>[</code>
            <code className={css(styles.runIndex)}>
              {isRunning || isQueued ? '*' : runIndex === -1 ? '' : runIndex}
            </code>
            <code>]</code>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default RunIndicator;
