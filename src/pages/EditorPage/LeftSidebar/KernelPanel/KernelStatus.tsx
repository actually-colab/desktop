import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Popover, Whisper } from 'rsuite';

import { spacing, timing } from '../../../../constants/theme';
import useKernelStatus from '../../../../kernel/useKernelStatus';
import { KeyValue, StatusIndicator } from '../../../../components';

const styles = StyleSheet.create({
  popoverContainer: {
    maxWidth: 400,
  },
  description: {
    marginTop: spacing.DEFAULT / 4,
    marginBottom: spacing.DEFAULT / 2,
    fontSize: 12,
  },
});

/**
 * Display the status of the kernel
 */
const KernelStatus: React.FC = () => {
  const { kernelStatus, kernelStatusColor } = useKernelStatus();

  return (
    <Whisper
      placement="rightStart"
      trigger="hover"
      delayShow={timing.SHOW_DELAY}
      delayHide={timing.HIDE_DELAY}
      speaker={
        <Popover title="Understanding the status">
          <div className={css(styles.popoverContainer)}>
            <div className="markdown-container">
              <p className={css(styles.description)}>
                <code>Offline</code> The kernel is not connected so you cannot run your code. We will automatically try
                connecting to the kernel periodically.
              </p>
              <p className={css(styles.description)}>
                <code>Connecting</code> We are trying to connect to the kernel.
              </p>
              <p className={css(styles.description)}>
                <code>Reconnecting</code> The kernel connection was lost and we are trying to reestablish it. If
                successful, it'll be like nothing happened. If we aren't, you'll need a new connection.
              </p>
              <p className={css(styles.description)}>
                <code>Busy</code> The kernel is running your code, some jobs take longer to finish than others.
              </p>
              <p className={css(styles.description)}>
                <code>Idle</code> The kernel is ready for you to use.
              </p>
            </div>
          </div>
        </Popover>
      }
    >
      <div>
        <KeyValue
          attributeKey="Kernel Status"
          attributeValue={
            <React.Fragment>
              <StatusIndicator textPlacement="right" color={kernelStatusColor} />
              {kernelStatus === 'Connecting' ? 'Offline' : kernelStatus}
            </React.Fragment>
          }
        />
      </div>
    </Whisper>
  );
};

export default KernelStatus;
