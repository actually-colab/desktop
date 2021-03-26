import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { palette, spacing } from '../../../constants/theme';
import { HEADER_HEIGHT, RIGHT_SIDEBAR_PANEL_WIDTH, RIGHT_SIDEBAR_TRAY_WIDTH } from '../../../constants/dimensions';
import { ColoredIconButton } from '../../../components';
import {
  CollaboratorsPanel,
  CommentsPanel,
  DownloadsPanel,
  HelpPanel,
  SettingsPanel,
  StatsPanel,
} from '../RightSidebar';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: HEADER_HEIGHT,
    bottom: 0,
    backgroundColor: palette.BASE,
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
    width: RIGHT_SIDEBAR_TRAY_WIDTH,
    display: 'flex',
    flexDirection: 'column',
  },
  pane: {
    width: RIGHT_SIDEBAR_PANEL_WIDTH,
    height: '100%',
    ...spacing.pad({ top: spacing.DEFAULT / 2 }),
    backgroundColor: palette.BASE_FADED,
    overflowY: 'auto',
  },
  paneBody: {
    paddingTop: spacing.DEFAULT / 2,
  },
});

/**
 * The right sidebar for the editor page
 */
const RightSidebar: React.FC = () => {
  const [visibleMenu, setVisibleMenu] = React.useState<
    'Collaborators' | 'Comments' | 'Stats' | 'Downloads' | 'Settings' | 'Help' | ''
  >('');

  const openMenu = React.useCallback((menu: typeof visibleMenu) => {
    setVisibleMenu((prevMenu) => (prevMenu === menu ? '' : menu));
  }, []);

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
            active={visibleMenu === 'Comments'}
            icon="comments"
            tooltipText="Comments"
            tooltipDirection="left"
            onClick={() => openMenu('Comments')}
          />
          <ColoredIconButton
            active={visibleMenu === 'Stats'}
            icon="area-chart"
            tooltipText="Stats"
            tooltipDirection="left"
            onClick={() => openMenu('Stats')}
          />
          <ColoredIconButton
            active={visibleMenu === 'Downloads'}
            icon="download2"
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
          <ColoredIconButton
            active={visibleMenu === 'Help'}
            icon="question"
            tooltipText="Help"
            tooltipDirection="left"
            onClick={() => openMenu('Help')}
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
          <h4>{visibleMenu}</h4>

          <div className={css(styles.paneBody)}>
            {visibleMenu === 'Collaborators' && <CollaboratorsPanel />}
            {visibleMenu === 'Comments' && <CommentsPanel />}
            {visibleMenu === 'Stats' && <StatsPanel />}
            {visibleMenu === 'Downloads' && <DownloadsPanel />}
            {visibleMenu === 'Settings' && <SettingsPanel />}
            {visibleMenu === 'Help' && <HelpPanel />}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
