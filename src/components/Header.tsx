import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { palette } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 42,
    backgroundColor: palette.BASE_FADED,
    '-webkit-app-region': 'drag',
    '-webkit-user-select': 'none',
  },
});

const Header: React.FC = ({ children }) => {
  return <div className={css(styles.container)}>{children}</div>;
};

export default Header;
