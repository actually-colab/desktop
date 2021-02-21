import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { format } from 'date-fns';
import { Icon } from 'rsuite';

import { ReduxState } from '../../../redux';
import { palette, spacing } from '../../../constants/theme';
import useKernelStatus from '../../../kernel/useKernelStatus';
import { StatusIndicator } from '../../../components';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    overflowY: 'hidden',
  },
  keyValue: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: spacing.DEFAULT / 2,
  },
  keyText: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  valueText: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  output: {
    flex: 1,
    marginTop: spacing.DEFAULT / 4,
    paddingLeft: spacing.DEFAULT / 2,
    paddingRight: spacing.DEFAULT / 4,
    borderRadius: 4,
    backgroundColor: palette.CHARCOAL,
    color: palette.BASE,
    overflowX: 'auto',
    overflowY: 'auto',
    paddingTop: spacing.DEFAULT / 2,
    fontSize: 12,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  bold: {
    fontWeight: 'bold',
  },
});

const KeyValue: React.FC<{ attributeKey: string | React.ReactNode; attributeValue: string | React.ReactNode }> = ({
  attributeKey,
  attributeValue,
}) => {
  return (
    <div className={css(styles.keyValue)}>
      <span className={css(styles.keyText)}>{attributeKey}</span>
      <span className={css(styles.valueText)}>{attributeValue}</span>
    </div>
  );
};

const KernelPanel: React.FC = () => {
  const kernelStatus = useKernelStatus();
  const kernelPid = useSelector((state: ReduxState) => state.editor.kernelPid);
  const gatewayVersion = useSelector((state: ReduxState) => state.editor.gatewayVersion);
  const kernelStdout = useSelector((state: ReduxState) => state.editor.kernelStdout);

  const statusColor = React.useMemo(
    () =>
      kernelStatus === 'Error'
        ? palette.ERROR
        : kernelStatus === 'Busy'
        ? palette.WARNING
        : kernelStatus === 'Idle'
        ? palette.SUCCESS
        : palette.GRAY,
    [kernelStatus]
  );

  return (
    <div className={css(styles.container)}>
      <KeyValue
        attributeKey="Gateway Version"
        attributeValue={
          <React.Fragment>
            {gatewayVersion ? (
              <Icon icon="check" style={{ color: palette.SUCCESS, marginRight: spacing.DEFAULT / 4 }} />
            ) : (
              <Icon icon="close" style={{ color: palette.ERROR, marginRight: spacing.DEFAULT / 4 }} />
            )}
            {gatewayVersion || 'Unknown'}
          </React.Fragment>
        }
      />
      <KeyValue
        attributeKey="Kernel Status"
        attributeValue={
          <React.Fragment>
            <StatusIndicator textPlacement="right" color={statusColor} /> {kernelStatus}
          </React.Fragment>
        }
      />
      <KeyValue
        attributeKey="Kernal PID"
        attributeValue={
          <React.Fragment>
            {kernelPid !== -1 ? (
              <Icon icon="check" style={{ color: palette.SUCCESS, marginRight: spacing.DEFAULT / 4 }} />
            ) : (
              <Icon icon="close" style={{ color: palette.ERROR, marginRight: spacing.DEFAULT / 4 }} />
            )}
            {kernelPid !== -1 ? kernelPid : 'No Process'}
          </React.Fragment>
        }
      />

      <p className={css(styles.keyText)}>Kernel Stdout</p>
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
