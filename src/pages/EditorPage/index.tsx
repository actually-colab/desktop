import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Dropdown } from 'rsuite';

import EditorSidebar from './EditorSidebar';
import { palette } from '../../constants/theme';
import { Header } from '../../components';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    paddingRight: 8,
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  page: {
    display: 'flex',
    flex: 1,
  },
  editableAreaContainer: {
    display: 'flex',
    flex: 1,
    backgroundColor: palette.BASE,
  },
});

const EditorPage: React.FC = () => {
  const [tempKernelSelection, setTempKernelSelection] = React.useState<string>('Select Kernel');
  return (
    <div className={css(styles.container)}>
      <Header>
        <div className={css(styles.header)}>
          <Dropdown
            title={tempKernelSelection}
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

      <div className={css(styles.page)}>
        <EditorSidebar />

        <div className={css(styles.editableAreaContainer)} />
      </div>
    </div>
  );
};

export default EditorPage;
