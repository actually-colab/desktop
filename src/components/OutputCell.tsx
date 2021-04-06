import type { DUser } from '@actually-colab/editor-types';

import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { DisplayData, ExecuteResult, KernelOutputError, Media, Output, StreamText } from '@nteract/outputs';

import { ReduxState } from '../types/redux';
import { spacing } from '../constants/theme';
import { ImmutableEditorCell } from '../immutable';
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
const OutputCell: React.FC<{ cell: ImmutableEditorCell; uid?: DUser['uid'] }> = ({ cell, uid }) => {
  const outputs = useSelector((state: ReduxState) => state.editor.outputs);

  const cellOutputs = React.useMemo(
    () =>
      outputs
        .get(cell.cell_id)
        ?.filter((output) => output.runIndex === cell.runIndex && output.uid === uid)
        ?.sort(sortImmutableOutputByMessageIndex) ?? null,
    [cell.cell_id, cell.runIndex, outputs, uid]
  );

  return (
    <div className={css(styles.container)}>
      {cellOutputs !== null && cellOutputs.size > 0 && (
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
