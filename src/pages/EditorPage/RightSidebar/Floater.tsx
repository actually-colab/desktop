import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { palette, spacing } from '../../../constants/theme';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  relativeContainer: {
    position: 'relative',
  },
  absoluteContainer: {
    position: 'absolute',
    width: 77,
    top: spacing.DEFAULT / 2,
    right: spacing.DEFAULT / 2,
    padding: spacing.DEFAULT / 4,
    backgroundColor: palette.BASE,
    borderRadius: 6,
    border: `1px solid ${palette.BASE_BORDER}`,
  },
});

const Floater: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <div className={css(styles.relativeContainer)}>
        <div className={css(styles.absoluteContainer)}>Read Only</div>
      </div>
    </div>
  );
};

export default Floater;
