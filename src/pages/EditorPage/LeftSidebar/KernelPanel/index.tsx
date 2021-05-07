import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon } from 'rsuite';

import { spacing } from '../../../../constants/theme';
import { openCompanionDownloadsPage } from '../../../../utils/redirect';
import { BorderContainer } from '../../../../components';
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
  downloadContainer: {
    marginBottom: spacing.DEFAULT / 2,
  },
  description: {
    marginTop: spacing.DEFAULT / 4,
    marginBottom: spacing.DEFAULT / 2,
    fontSize: 12,
  },
});

/**
 * The kernel panel of the left sidebar of the editor page
 */
const KernelPanel: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <div className={css(styles.downloadContainer)}>
        <BorderContainer>
          <Button block onClick={() => openCompanionDownloadsPage()}>
            <Icon icon="download2" style={{ marginRight: spacing.DEFAULT / 2 }} />
            Download Companion
          </Button>
        </BorderContainer>

        <p className={css(styles.description)}>
          Our Kernel Companion manages the kernel process and allows you to run code locally. If we don't support your
          OS,{' '}
          <a
            href="https://github.com/actually-colab/desktop-launcher#starting-the-kernel-manually"
            target="_blank"
            rel="noreferrer"
          >
            read more here
          </a>
          .
        </p>
      </div>

      <KernelConnector />

      <KernelStatus />

      <KernelLogs />
    </div>
  );
};

export default KernelPanel;
