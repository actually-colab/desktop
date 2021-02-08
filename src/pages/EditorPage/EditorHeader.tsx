import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Avatar, Button, Dropdown, Icon, Popover, Tooltip, Whisper } from 'rsuite';
import { WhisperInstance } from 'rsuite/lib/Whisper';

import { ColoredIconButton, Header, StatusIndicator } from '../../components';
import { StatusIndicatorProps } from '../../components/StatusIndicator';
import { palette, spacing } from '../../constants/theme';
import { ReduxState } from '../../redux';
import useKernelStatus from '../../kernel/useKernelStatus';

const styles = StyleSheet.create({
  header: {
    paddingLeft: 220,
    paddingRight: 8,
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
  kernelContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIcon: {
    marginLeft: spacing.DEFAULT / 2,
  },
});

const EditorHeader: React.FC = () => {
  const localKernelStatus = useKernelStatus();
  const connectToKernelErrorMessage = useSelector((state: ReduxState) => state.editor.connectToKernelErrorMessage);

  const kernelMenuRef = React.createRef<WhisperInstance>();
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

  const handleKernelSelect = React.useCallback(
    (eventKey: string) => {
      setTempKernelSelection(eventKey);
      kernelMenuRef.current?.close();
    },
    [kernelMenuRef]
  );

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

          <Whisper
            placement="bottomEnd"
            trigger="click"
            ref={kernelMenuRef}
            speaker={
              <Popover full>
                <Dropdown.Menu activeKey={tempKernelSelection} onSelect={handleKernelSelect}>
                  <Dropdown.Item eventKey="localhost">localhost</Dropdown.Item>
                </Dropdown.Menu>
              </Popover>
            }
          >
            <Button appearance="subtle" size="md">
              <div className={css(styles.kernelContainer)}>
                {tempKernelSelection !== '' && (
                  <StatusIndicator textPlacement="right" color={statusColor} tooltipOptions={statusTooltip} />
                )}

                {tempKernelSelection}

                <div className={css(styles.dropdownIcon)}>
                  <Icon icon="arrow-down-line" />
                </div>
              </div>
            </Button>
          </Whisper>
        </div>
      </div>
    </Header>
  );
};

export default EditorHeader;
