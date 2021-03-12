import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { palette } from '../constants/theme';

import { HEADER_HEIGHT, LEFT_SIDEBAR_WIDTH } from '../constants/dimensions';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: LEFT_SIDEBAR_WIDTH,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    height: HEADER_HEIGHT,
    backgroundColor: `${palette.GRAY}15`,
    'backdrop-filter': 'blur(16px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderColor: palette.BASE_BORDER,
  },
});

/**
 * A draggable header wrapper
 */
const Header: React.FC = ({ children }) => {
  return <div className={css(styles.container)}>{children}</div>;
};

export default Header;
