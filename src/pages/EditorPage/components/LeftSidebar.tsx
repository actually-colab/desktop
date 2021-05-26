import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { palette, spacing } from '../../../constants/theme';
import { HEADER_HEIGHT, LEFT_SIDEBAR_PANEL_WIDTH } from '../../../constants/dimensions';

import { ProjectsPanel } from '../LeftSidebar';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: palette.BASE_FADED,
  },
  titleContainer: {
    height: HEADER_HEIGHT,
    ...spacing.pad({ top: spacing.DEFAULT / 2 }),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    background: '-webkit-linear-gradient(top left, #f55673, #E2CC52)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
  },
  panel: {
    paddingTop: spacing.DEFAULT / 2,
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflowY: 'hidden',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderColor: palette.BASE_BORDER,
  },
  bodyContainer: {
    width: LEFT_SIDEBAR_PANEL_WIDTH,
    paddingLeft: spacing.DEFAULT,
    paddingRight: spacing.DEFAULT,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
});

/**
 * The left sidebar for the editor page
 */
const LeftSidebar: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <div className={css(styles.titleContainer)}>
        <p className={css(styles.title)}>actually colab</p>
      </div>
      <div className={css(styles.panel)}>
        <div className={css(styles.bodyContainer)}>
          <ProjectsPanel />
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
