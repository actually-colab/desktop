/**
 * Protocol for the desktop companion
 */
export const PROTOCOL_URI = 'actuallycolab://';

/**
 * Open the companion with a given payload
 */
export const openCompanion = (payload: string = '') => {
  const link = document.createElement('a');
  link.href = `actuallycolab://${payload}`;
  document.body.appendChild(link);
  link.click();
};
