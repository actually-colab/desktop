import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import { ReduxState } from '../redux';
import { EditorCell } from '../types/notebook';
import { sortOutputByMessageIndex } from '../utils/notebook';

const styles = StyleSheet.create({
  container: {},
});

const OutputCell: React.FC<{ cell: EditorCell; uid?: string }> = ({ cell, uid }) => {
  const outputs = useSelector((state: ReduxState) => state.editor.outputs);

  const cellOutputs = React.useMemo(
    () =>
      outputs
        .filter((output) => output.runIndex === cell.runIndex && output.cell_id === cell.cell_id && output.uid === uid)
        .sort(sortOutputByMessageIndex),
    [cell.cell_id, cell.runIndex, outputs, uid]
  );

  return (
    <div className={css(styles.container)}>
      {cellOutputs.map((output) => (
        <React.Fragment key={output.output_id}>
          {output.name === 'stdout' ? (
            <pre>{output.data.text}</pre>
          ) : output.name === 'display_data' ? (
            <React.Fragment>
              {output.data.text !== undefined && <pre>{output.data.text}</pre>}
              {output.data.image !== undefined && <img src={`data:image/png;base64, ${output.data.image}`} alt="" />}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <pre>{output.data.ename}</pre>
              <pre>{output.data.evalue}</pre>
              <pre>{output.data.traceback.join('\n')}</pre>
            </React.Fragment>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default OutputCell;
