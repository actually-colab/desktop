/**
 * The notification severity level
 */
export type UINotificationLevel = 'info' | 'success' | 'warning' | 'error';

/**
 * The core component of the notification that must be manually specified
 */
export type UINotificationCore = {
  level: UINotificationLevel;
  /**
   * Millseconds. Set to 0 to not auto close
   */
  duration: number;
  title: string;
  message: string;
};

/**
 * A notification to display over the page
 */
export type UINotification = UINotificationCore & {
  /**
   * Set automatically upon receiving the request
   */
  id: string;
  /**
   * Set automatically upon receiving the request
   */
  expiration: Date;
};
