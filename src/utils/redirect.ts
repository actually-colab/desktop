/**
 * Protocol for the desktop companion
 */
export const PROTOCOL_URI = 'actuallycolab://';

/**
 * The link to the companion releases page
 */
export const COMPANION_DOWNLOADS_URI = 'https://github.com/actually-colab/desktop-launcher/releases';

/**
 * The link to the project github page
 */
export const GITHUB_URI = 'https://github.com/actually-colab';

/**
 * Open a link in a new tab
 */
export const openLink = (link: string): void => {
  window.open(link, '_blank');
};

export const openGithub = (): void => openLink(GITHUB_URI);

/**
 * Open the companion with a given payload
 */
export const openCompanion = (payload: string = ''): void => {
  window.open(`${PROTOCOL_URI}${payload}`, '_self');
};

/**
 * Open the companion downloads page in a new tab
 */
export const openCompanionDownloadsPage = (): void => openLink(COMPANION_DOWNLOADS_URI);
