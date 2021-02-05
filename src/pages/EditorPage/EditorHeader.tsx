import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Dropdown } from 'rsuite';

import { Header, StatusIndicator } from '../../components';
import { palette } from '../../constants/theme';

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
  const [kernelStatus, setKernelStatus] = React.useState<'Offline' | 'Error' | 'Busy' | 'Idle'>('Offline');
  const [tempKernelSelection, setTempKernelSelection] = React.useState<string>('');

  return (
    <Header>
      <div className={css(styles.header)}>
        <Dropdown
          title={
            <div className={css(styles.kernelContainer)}>
              {tempKernelSelection !== '' && (
                <StatusIndicator
                  textPlacement="right"
                  color={
                    kernelStatus === 'Error'
                      ? palette.ERROR
                      : kernelStatus === 'Busy'
                      ? palette.WARNING
                      : kernelStatus === 'Idle'
                      ? palette.SUCCESS
                      : palette.GRAY
                  }
                  tooltipOptions={{
                    placement: 'bottomEnd',
                    text: kernelStatus,
                  }}
                />
              )}

              {tempKernelSelection === '' ? 'Select Kernel' : tempKernelSelection}
            </div>
          }
          activeKey={tempKernelSelection}
          size="sm"
          placement="bottomEnd"
          onSelect={(eventKey) => setTempKernelSelection(eventKey)}
        >
          <Dropdown.Item eventKey="localhost">localhost</Dropdown.Item>
          <Dropdown.Item eventKey="Some User">Some User</Dropdown.Item>
        </Dropdown>
      </div>
    </Header>
  );
};

export default EditorHeader;
