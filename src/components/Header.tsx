import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { palette } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 36,
    backgroundColor: palette.BASE,
    '-webkit-app-region': 'drag',
    '-webkit-user-select': 'none',
  },
});

const Header: React.FC = () => {
  return <div className={css(styles.container)} />;
};

export default Header;
