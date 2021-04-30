import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { List as ImmutableList } from 'immutable';
import { DisplayData, ExecuteResult, KernelOutputError, Media, Output, StreamText } from '@nteract/outputs';

import { ReduxState } from '../../types/redux';
import { spacing } from '../../constants/theme';
import { ImmutableEditorCell, ImmutableKernelOutput } from '../../immutable';

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
const OutputCell: React.FC<{ cell: ImmutableEditorCell }> = ({ cell }) => {
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const outputsMetadata = useSelector((state: ReduxState) =>
    state.editor.outputsMetadata.get(cell.cell_id)?.get(selectedOutputsUid)
  );
  const cellOutputs = useSelector(
    (state: ReduxState) =>
      state.editor.outputs
        .get(cell.cell_id)
        ?.get(selectedOutputsUid)
        ?.get((selectedOutputsUid === '' ? cell.runIndex : outputsMetadata?.runIndex ?? -1).toString()) ??
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
