import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { DisplayData, ExecuteResult, KernelOutputError, Media, Output, StreamText } from '@nteract/outputs';

import { ReduxState } from '../redux';
import { User } from '../types/user';
import { ImmutableEditorCell, KernelOutput } from '../types/notebook';
import { spacing } from '../constants/theme';
import { sortImmutableOutputByMessageIndex } from '../utils/notebook';

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
const OutputCell: React.FC<{ cell: ImmutableEditorCell; uid?: User['uid'] }> = ({ cell, uid }) => {
  const outputs = useSelector((state: ReduxState) => state.editor.outputs);

  const cellOutputs = React.useMemo(
    () =>
      outputs
        .filter(
          (output) =>
            output.get('runIndex') === cell.get('runIndex') &&
            output.get('cell_id') === cell.get('cell_id') &&
            output.get('uid') === uid
        )
        .sort(sortImmutableOutputByMessageIndex),
    [cell, outputs, uid]
  );

  return (
    <div className={css(styles.container)}>
      {cellOutputs.size > 0 && (
        <pre className={css(styles.output)}>
          {cellOutputs.map((output) => (
            <Output key={output.get('output_id')} output={output.get('output')}>
              <DisplayData>
                <Media.HTML />
                <Media.Image mediaType="image/png" />
                <Media.Image mediaType="image/jpeg" />
                <Media.Image mediaType="image/gif" />
                <Media.Plain />
              </DisplayData>
              <ExecuteResult>
                <Media.Json />
                <Media.HTML />
                <Media.SVG />
                <Media.Image mediaType="image/png" />
                <Media.Image mediaType="image/jpeg" />
                <Media.Image mediaType="image/gif" />
                <Media.Plain />
              </ExecuteResult>
              <StreamText />
              <KernelOutputError />
            </Output>
          ))}
        </pre>
      )}
    </div>
  );
};

export default OutputCell;
