import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { format } from 'date-fns';

import { ReduxState } from '../../../redux';
import { spacing } from '../../../constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 0,
    minWidth: 0,
  },
  output: {
    margin: 0,
    overflowX: 'auto',
    paddingTop: spacing.DEFAULT / 2,
    paddingBottom: spacing.DEFAULT,
    fontSize: 12,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  bold: {
    fontWeight: 'bold',
  },
});

const KernelPanel: React.FC = () => {
  const kernelStdout = useSelector((state: ReduxState) => state.editor.kernelStdout);

  return (
    <div className={css(styles.container)}>
      {kernelStdout.length > 0 && (
        <pre className={css(styles.output)}>
          {kernelStdout.map((stdout) => (
            <React.Fragment key={stdout.id}>
              <span className={css(styles.bold)}>{format(stdout.date, 'Pp')}</span>
              {'\n'}
              {stdout.message}
              {'\n\n'}
            </React.Fragment>
          ))}
        </pre>
      )}
    </div>
  );
};

export default KernelPanel;
