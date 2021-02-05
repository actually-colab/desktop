import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Dropdown } from 'rsuite';

import { Header, StatusIndicator } from '../../components';
import { StatusIndicatorProps } from '../../components/StatusIndicator';
import { palette } from '../../constants/theme';
import { ReduxState } from '../../redux';
import useKernelStatus from '../../kernel/useKernelStatus';

const styles = StyleSheet.create({
  header: {
    paddingRight: 8,
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  kernelContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
});

const EditorHeader: React.FC = () => {
  const localKernelStatus = useKernelStatus();
  const connectToKernelErrorMessage = useSelector((state: ReduxState) => state.editor.connectToKernelErrorMessage);

  const [tempKernelSelection, setTempKernelSelection] = React.useState<string>('localhost');

  const kernelStatus = React.useMemo(() => (tempKernelSelection === 'localhost' ? localKernelStatus : 'Offline'), [
    localKernelStatus,
    tempKernelSelection,
  ]);

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

  const statusTooltip = React.useMemo<StatusIndicatorProps['tooltipOptions']>(
    () => ({
      placement: 'bottomEnd',
      text: kernelStatus === 'Error' ? `Error: ${connectToKernelErrorMessage}` : kernelStatus,
    }),
    [connectToKernelErrorMessage, kernelStatus]
  );

  return (
    <Header>
      <div className={css(styles.header)}>
        <Dropdown
          title={
            <div className={css(styles.kernelContainer)}>
              {tempKernelSelection !== '' && (
                <StatusIndicator textPlacement="right" color={statusColor} tooltipOptions={statusTooltip} />
              )}

              {tempKernelSelection}
            </div>
          }
          activeKey={tempKernelSelection}
          size="sm"
          placement="bottomEnd"
          onSelect={(eventKey) => setTempKernelSelection(eventKey)}
        >
          <Dropdown.Item eventKey="localhost">localhost</Dropdown.Item>
        </Dropdown>
      </div>
    </Header>
  );
};

export default EditorHeader;
