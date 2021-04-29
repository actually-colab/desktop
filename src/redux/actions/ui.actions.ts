import { nanoid } from 'nanoid';
import { addMilliseconds } from 'date-fns';

import { NOTIFICATION, UIActionTypes, UIAsyncActionTypes } from '../../types/redux/ui';
import { UINotification, UINotificationCore } from '../../types/ui';
import { notifyUntraced } from '../../utils/ui';

/**
 * Show a notification over the page
 */
const showNotification = (notification: UINotification): UIActionTypes => {
  return {
    type: NOTIFICATION.SHOW,
    notification,
  };
};

/**
 * Hide a given notification
 */
const hideNotification = (id: UINotification['id']): UIActionTypes => {
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
    id: nanoid(),
    expiration: addMilliseconds(new Date(), notification.duration),
  };

  dispatch(showNotification(fullNotification));

  // Trigger a notification via rsuite
  notifyUntraced(fullNotification, () => {
    dispatch(hideNotification(fullNotification.id));
  });
};
