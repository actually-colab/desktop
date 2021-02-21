import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Placeholder } from 'rsuite';

import { palette, spacing } from '../../../constants/theme';
import { ColoredIconButton } from '../../../components';

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderColor: palette.BASE_BORDER,
    display: 'flex',
    flexDirection: 'row',
  },
  navContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  menuButtons: {
    display: 'flex',
    flexDirection: 'column',
  },
  pane: {
    width: 250,
    height: '100%',
    ...spacing.pad(spacing.DEFAULT, { top: spacing.DEFAULT / 2 }),
    backgroundColor: palette.BASE_FADED,
    overflowY: 'auto',
  },
});

/**
 * The right sidebar for the editor page
 */
const RightSidebar: React.FC = () => {
  const [visibleMenu, setVisibleMenu] = React.useState<string>('');

  const openMenu = React.useCallback(
    (menu: string) => {
      if (visibleMenu === menu) {
        setVisibleMenu('');
      } else {
        setVisibleMenu(menu);
      }
    },
    [visibleMenu]
  );

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.navContainer)}>
        <div className={css(styles.menuButtons)}>
          <ColoredIconButton
            active={visibleMenu === 'Collaborators'}
            icon="group"
            tooltipText="Collaborators"
            tooltipDirection="left"
            onClick={() => openMenu('Collaborators')}
          />
          <ColoredIconButton
            active={visibleMenu === 'Kernel Logs'}
            icon="tasks"
            tooltipText="Kernel Logs"
            tooltipDirection="left"
            onClick={() => openMenu('Kernel Logs')}
          />
          <ColoredIconButton
            active={visibleMenu === 'Downloads'}
            icon="download"
            tooltipText="Downloads"
            tooltipDirection="left"
            onClick={() => openMenu('Downloads')}
          />
          <ColoredIconButton
            active={visibleMenu === 'Settings'}
            icon="wrench"
            tooltipText="Project Settings"
            tooltipDirection="left"
            onClick={() => openMenu('Settings')}
          />
        </div>

        <ColoredIconButton
          size="lg"
          icon="arrow-right-line"
          tooltipText="Hide menu"
          tooltipDirection="left"
          disabled={visibleMenu === ''}
          onClick={() => setVisibleMenu('')}
        />
      </div>

      {visibleMenu !== '' && (
        <div className={css(styles.pane)}>
          <h6>{visibleMenu}</h6>

          <Placeholder.Paragraph rows={30} active />
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
