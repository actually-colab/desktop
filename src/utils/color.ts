import randomColor from 'randomcolor';
import { DUser } from '@actually-colab/editor-types';

/**
 * Generate a random color deterministically by uid
 */
export const getUserColor = (uid: DUser['uid']): string =>
  randomColor({
    seed: uid,
    luminosity: 'dark',
  });

export { randomColor };
