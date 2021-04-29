import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { List as ImmutableList } from 'immutable';
import { DisplayData, ExecuteResult, KernelOutputError, Media, Output, StreamText } from '@nteract/outputs';

import { ReduxState } from '../types/redux';
import { spacing } from '../constants/theme';
import { ImmutableEditorCell, ImmutableKernelOutput } from '../immutable';

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
  const outputs = useSelector((state: ReduxState) => state.editor.outputs.get(cell.cell_id)?.get(selectedOutputsUid));
  const outputsMetadata = useSelector((state: ReduxState) =>
    state.editor.outputsMetadata.get(cell.cell_id)?.get(selectedOutputsUid)
  );

  const runIndex = React.useMemo(() => (selectedOutputsUid === '' ? cell.runIndex : outputsMetadata?.runIndex ?? -1), [
    cell.runIndex,
    outputsMetadata,
    selectedOutputsUid,
  ]);
  const cellOutputs = React.useMemo(() => outputs?.get(runIndex.toString()) ?? ImmutableList<ImmutableKernelOutput>(), [
    outputs,
    runIndex,
  ]);

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
