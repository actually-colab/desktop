/**
 * Protocol for the desktop companion
 */
export const PROTOCOL_URI = 'actuallycolab://';

/**
 * The link to the companion releases page
 */
export const COMPANION_DOWNLOADS_URI = 'https://github.com/actually-colab/desktop-launcher/releases';

/**
 * Open the companion with a given payload
 */
export const openCompanion = (payload: string = '') => {
  window.open(`${PROTOCOL_URI}${payload}`, '_self');
};

/**
 * Open the companion downloads page in a new tab
 */
export const openCompanionDownloadsPage = () => {
  window.open(COMPANION_DOWNLOADS_URI, '_blank');
};
