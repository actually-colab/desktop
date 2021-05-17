import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Divider } from 'rsuite';

import ExecutionButtons from './ExecutionButtons';
import CellButtons from './CellButtons';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * Primary buttons to act on the notebook from the editor header
 */
const ActionButtons: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <ExecutionButtons />
      <Divider vertical />
      <CellButtons />
    </div>
  );
};

export default ActionButtons;
