import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Avatar, Dropdown, Tooltip, Whisper } from 'rsuite';

import { ColoredIconButton, Header, PopoverDropdown, StatusIndicator } from '../../components';
import { StatusIndicatorProps } from '../../components/StatusIndicator';
import { palette, spacing } from '../../constants/theme';
import { ReduxState } from '../../redux';
import useKernelStatus from '../../kernel/useKernelStatus';

const styles = StyleSheet.create({
  header: {
    paddingLeft: 220,
    paddingRight: 4,
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerNoDrag: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    '-webkit-app-region': 'no-drag',
  },
  avatars: {
    marginRight: spacing.DEFAULT / 2,
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

  const handleKernelSelect = React.useCallback((eventKey: string) => {
    setTempKernelSelection(eventKey);
  }, []);

  return (
    <Header>
      <div className={css(styles.header)}>
        <div className={css(styles.headerNoDrag)}>
          <ColoredIconButton
            icon="play"
            color={palette.SUCCESS}
            tooltipText="Run the current cell"
            tooltipDirection="bottom"
            onClick={() => console.log('TODO')}
          />
          <ColoredIconButton
            icon="stop"
            color={palette.ERROR}
            tooltipText="Interrupt the kernel"
            tooltipDirection="bottom"
            onClick={() => console.log('TODO')}
          />
          <ColoredIconButton
            icon="plus"
            tooltipText="Create a new cell"
            tooltipDirection="bottom"
            onClick={() => console.log('TODO')}
          />
        </div>

        <div className={css(styles.headerNoDrag)}>
          <div className={css(styles.avatars)}>
            <Whisper placement="bottomEnd" trigger="hover" delay={500} speaker={<Tooltip>Bailey Tincher</Tooltip>}>
              <Avatar size="sm" circle>
                BT
              </Avatar>
            </Whisper>
          </div>

          <PopoverDropdown
            placement="bottomEnd"
            activeKey={tempKernelSelection}
            buttonContent={
              <React.Fragment>
                {tempKernelSelection !== '' && (
                  <StatusIndicator textPlacement="right" color={statusColor} tooltipOptions={statusTooltip} />
                )}

                {tempKernelSelection}
              </React.Fragment>
            }
            onSelect={handleKernelSelect}
          >
            <Dropdown.Item eventKey="localhost">localhost</Dropdown.Item>
          </PopoverDropdown>
        </div>
      </div>
    </Header>
  );
};

export default EditorHeader;