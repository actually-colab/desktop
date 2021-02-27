import { Notification } from 'rsuite';

import { UINotification } from '../types/ui';

/**
 * Send a notification that isn't tracked in redux
 */
export const notifyUntraced = (notification: UINotification, onClose?: (id: string) => void) => {
  Notification[notification.level]({
    key: notification.id,
    title: notification.title,
    description: notification.message,
    duration: notification.duration,
    onClose: () => onClose?.(notification.id),
  });
};

/**
 * Hide a notification with the given id
 */
export const closeNotification = (id: UINotification['id']) => {
  Notification.close(id);
};

/**
 * Hide all notifications
 */
export const closeAllNotifications = () => {
  Notification.closeAll();
};
