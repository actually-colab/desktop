import { NOTIFICATION, UIActionTypes } from '../types/redux/ui';
import { UINotification } from '../types/ui';

/**
 * The UI redux state
 */
export interface UIState {
  notifications: UINotification[];
}

const initialState: UIState = {
  notifications: [],
};

/**
 * The UI reducer
 */
const reducer = (state = initialState, action: UIActionTypes): UIState => {
  switch (action.type) {
    case NOTIFICATION.SHOW:
      return {
        ...state,
        notifications: [...state.notifications, action.notification],
      };
    case NOTIFICATION.HIDE:
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.id === action.id),
      };
    default:
      return state;
  }
};

export default reducer;
