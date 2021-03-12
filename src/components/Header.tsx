import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { palette } from '../constants/theme';

import { HEADER_HEIGHT } from '../constants/dimensions';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: HEADER_HEIGHT,
    backgroundColor: palette.BASE_FADED,
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
