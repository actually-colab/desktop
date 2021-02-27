import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import Ansi from 'ansi-to-react';

import { ReduxState } from '../redux';
import { User } from '../types/user';
import { EditorCell } from '../types/notebook';
import { spacing } from '../constants/theme';
import { sortOutputByMessageIndex } from '../utils/notebook';

const styles = StyleSheet.create({
  container: {},
  output: {
    margin: 0,
    overflowX: 'auto',
    paddingTop: spacing.DEFAULT / 2,
    paddingBottom: spacing.DEFAULT,
  },
});

/**
 * A component to render the output of a cell
 */
const OutputCell: React.FC<{ cell: EditorCell; uid?: User['uid'] }> = ({ cell, uid }) => {
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
      {cellOutputs.length > 0 && (
        <pre className={css(styles.output)}>
          {cellOutputs.map((output) => (
            <React.Fragment key={output.output_id}>
              {output.channel === 'stdout' ? (
                output.data.text
              ) : output.channel === 'display_data' ? (
                <React.Fragment>
                  {output.data.text !== undefined && output.data.text}
                  {'\n'}
                  {output.data.image !== undefined && (
                    <img src={`data:image/png;base64, ${output.data.image}`} alt="" />
                  )}
                  {'\n'}
                </React.Fragment>
              ) : output.channel === 'html' ? (
                <React.Fragment>
                  {output.data.html !== undefined ? (
                    <div
                      className="output-html"
                      dangerouslySetInnerHTML={{
                        __html: output.data.html,
                      }}
                    />
                  ) : (
                    output.data.text !== undefined && output.data.text
                  )}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {output.data.ename}
                  {'\n'}
                  {output.data.evalue}
                  {'\n'}

                  <Ansi>{output.data.traceback.join('\n')}</Ansi>
                </React.Fragment>
              )}
            </React.Fragment>
          ))}
        </pre>
      )}
    </div>
  );
};

export default OutputCell;
