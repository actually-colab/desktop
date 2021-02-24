import { AuthActionTypes, LOAD_SESSION, SIGN_IN, SIGN_OUT } from '../types/redux/auth';
import { User } from '../types/user';

/**
 * The auth redux state
 */
export interface AuthState {
  isSessionLoaded: boolean;

  isSigningIn: boolean;
  signInErrorMessage: string;

  isAuthenticated: boolean;
  user: User | null;
  token: string;
}

const initialState: AuthState = {
  isSessionLoaded: false,

  isSigningIn: false,
  signInErrorMessage: '',

  isAuthenticated: false,
  user: null,
  token: '',
};

/**
 * The auth reducer
 */
const reducer = (state = initialState, action: AuthActionTypes): AuthState => {
  switch (action.type) {
    case LOAD_SESSION.SUCCESS:
      return {
        ...state,
        isSessionLoaded: true,
        token: action.token,
      };
    case LOAD_SESSION.FAILURE:
      return {
        ...state,
        isSessionLoaded: true,
      };
    case SIGN_IN.START:
      return {
        ...state,
        isSigningIn: true,
        signInErrorMessage: '',
      };
    case SIGN_IN.SUCCESS:
      return {
        ...state,
        isSigningIn: false,
        isAuthenticated: true,
        user: action.user,
        token: action.token,
      };
    case SIGN_IN.FAILURE:
      return {
        ...state,
        isSigningIn: false,
        signInErrorMessage: action.error.message,
      };
    case SIGN_OUT.SUCCESS:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: '',
      };
    default:
      return state;
  }
};

export default reducer;
