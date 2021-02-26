import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { UINotification } from '../ui';

export const NOTIFICATION = {
  SHOW: 'NOTIFICATION_SHOW',
  HIDE: 'NOTIFICATION_HIDE',
} as const;

type NotificationShowAction = {
  type: typeof NOTIFICATION.SHOW;
  notification: UINotification;
};

type NotificationHideAction = {
  type: typeof NOTIFICATION.HIDE;
  id: UINotification['id'];
};

/**
 * An action for updating the UI
 */
export type UIActionTypes = NotificationShowAction | NotificationHideAction;

/**
 * An asynchronous action for manipulating the UI redux store
 */
export type UIAsyncActionTypes = ThunkAction<void, unknown, unknown, Action<string>>;
