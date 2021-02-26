import { v4 as uuid } from 'uuid';
import { addMilliseconds } from 'date-fns';
import { Notification } from 'rsuite';

import { NOTIFICATION, UIActionTypes, UIAsyncActionTypes } from '../../types/redux/ui';
import { UINotification, UINotificationCore } from '../../types/ui';

/**
 * Show a notification over the page
 */
export const showNotification = (notification: UINotification): UIActionTypes => {
  // Trigger a notification via rsuite
  Notification[notification.level]({
    key: notification.id,
    title: notification.title,
    description: notification.message,
    duration: notification.duration,
  });

  return {
    type: NOTIFICATION.SHOW,
    notification,
  };
};

/**
 * Hide a given notification
 */
export const hideNotification = (id: UINotification['id']): UIActionTypes => {
  Notification.close(id);

  return {
    type: NOTIFICATION.HIDE,
    id,
  };
};

/**
 * Show a notification and automatically hide it after it expires
 */
export const notify = (notification: UINotificationCore): UIAsyncActionTypes => async (dispatch) => {
  const fullNotification: UINotification = {
    ...notification,
    id: uuid(),
    expiration: addMilliseconds(new Date(), notification.duration),
  };

  dispatch(showNotification(fullNotification));

  if (notification.duration > 0) {
    setTimeout(() => {
      dispatch(hideNotification(fullNotification.id));
    }, notification.duration);
  }
};
