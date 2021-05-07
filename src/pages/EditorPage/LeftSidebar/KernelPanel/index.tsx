import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import KernelConnector from './KernelConnector';
import KernelStatus from './KernelStatus';
import KernelLogs from './KernelLogs';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    overflowY: 'hidden',
  },
});

/**
 * The kernel panel of the left sidebar of the editor page
 */
const KernelPanel: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <KernelConnector />
      <KernelStatus />
      <KernelLogs />
    </div>
  );
};

export default KernelPanel;
