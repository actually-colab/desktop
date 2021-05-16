import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { spacing } from '../../../../constants/theme';
import { Header } from '../../../../components';
import CollaboratorsPopover from './CollaboratorsPopover';
import ActionButtons from './ActionButtons';
import UserAvatarList from './UserAvatarList';
import KernelSelector from './KernelSelector';

const styles = StyleSheet.create({
  header: {
    paddingRight: spacing.DEFAULT / 2,
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerNoDrag: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  padLeft: {
    marginLeft: spacing.DEFAULT / 2,
  },
});

/**
 * The header for the editor page
 */
const EditorHeader: React.FC = () => {
  return (
    <Header>
      <div className={css(styles.header)}>
        <ActionButtons />

        <div className={css(styles.headerNoDrag)}>
          <UserAvatarList />
          <KernelSelector />

          <div className={css(styles.padLeft)}>
            <CollaboratorsPopover />
          </div>
        </div>
      </div>
    </Header>
  );
};

export default EditorHeader;
