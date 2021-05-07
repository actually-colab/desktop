import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Icon, Timeline } from 'rsuite';

import { ReduxState } from '../../../../types/redux';
import { palette, spacing } from '../../../../constants/theme';

const styles = StyleSheet.create({
  keyText: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  output: {
    flex: 1,
    marginTop: spacing.DEFAULT / 8,
    paddingBottom: spacing.DEFAULT / 4,
    paddingTop: spacing.DEFAULT / 2,
    paddingLeft: spacing.DEFAULT / 2,
    paddingRight: spacing.DEFAULT / 4,
    borderRadius: 4,
    color: palette.ALMOST_BLACK,
    overflowX: 'auto',
    overflowY: 'auto',
    fontSize: 12,
    lineHeight: '12px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    display: 'flex',
    flexDirection: 'column-reverse',
  },
  outputScrollContainer: {},
  bold: {
    fontWeight: 'bold',
    lineHeight: '18px',
  },
});

/**
 * Show the logs from activity in the editor and kernel
 */
const KernelLogs: React.FC = () => {
  const logs = useSelector((state: ReduxState) => state.editor.logs);

  return (
    <React.Fragment>
      <p className={css(styles.keyText)}>Kernel Logs</p>
      <pre className={css(styles.output)}>
        <div className={css(styles.outputScrollContainer)}>
          <Timeline className="icon-timeline">
            {logs.map((log) => (
              <Timeline.Item
                key={log.id}
                dot={
                  log.status === 'Success' ? (
                    <Icon icon="check" style={{ background: palette.SUCCESS, color: palette.BASE }} />
                  ) : log.status === 'Warning' ? (
                    <Icon icon="exclamation" style={{ background: palette.WARNING, color: palette.BASE }} />
                  ) : log.status === 'Error' ? (
                    <Icon icon="close" style={{ background: palette.ERROR, color: palette.BASE }} />
                  ) : undefined
                }
              >
                <p className={css(styles.bold)}>{log.dateString}</p>
                <p>{log.message}</p>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </pre>
    </React.Fragment>
  );
};

export default KernelLogs;
