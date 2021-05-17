import * as React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { List as ImmutableList } from 'immutable';
import { DisplayData, ExecuteResult, KernelOutputError, Media, Output, StreamText } from '@nteract/outputs';

import { ReduxState } from '../../types/redux';
import { EditorCell } from '../../types/notebook';
import { spacing } from '../../constants/theme';
import { ImmutableKernelOutput } from '../../immutable';

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
const OutputCell: React.FC<{ cell_id: EditorCell['cell_id'] }> = ({ cell_id }) => {
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const runIndex = useSelector(
    (state: ReduxState) =>
      (state.editor.selectedOutputsUid === ''
        ? state.editor.cells.get(cell_id)?.runIndex
        : state.editor.outputsMetadata.get(cell_id)?.get(state.editor.selectedOutputsUid)?.runIndex) ?? -1,
    shallowEqual
  );
  const cellOutputs = useSelector(
    (state: ReduxState) =>
      state.editor.outputs.get(cell_id)?.get(selectedOutputsUid)?.get(runIndex.toString()) ??
      ImmutableList<ImmutableKernelOutput>()
  );

  return (
    <div className={css(styles.container)}>
      {cellOutputs.size > 0 && (
        <pre className={css(styles.output)}>
          {cellOutputs.map((output) => (
            <Output key={output.output_id} output={output.output}>
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
