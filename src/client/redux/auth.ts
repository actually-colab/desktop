import {
  AuthActionTypes,
  AUTH_REDIRECT_FAILURE,
  AUTH_REDIRECT_START,
  AUTH_REDIRECT_SUCCESS,
  LOAD_SESSION_FAILURE,
  LOAD_SESSION_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_IN_START,
  SIGN_IN_SUCCESS,
  SIGN_OUT_SUCCESS,
} from '../types/redux/auth';
import { User } from '../types/user';
import { LoginRedirectResponse } from '../utils/redirect';

/**
 * The auth redux state
 */
export interface AuthState {
  isSessionLoaded: boolean;

  isRedirecting: boolean;
  redirectErrorMessage: string;

  isSigningIn: boolean;
  signInErrorMessage: string;

  isAuthenticated: boolean;
  redirectResponse: LoginRedirectResponse | null;
  user: User | null;
  token: string;
}

const initialState: AuthState = {
  isSessionLoaded: false,

  isRedirecting: false,
  redirectErrorMessage: '',

  isSigningIn: false,
  signInErrorMessage: '',

  isAuthenticated: false,
  redirectResponse: null,
  user: null,
  token: '',
};

/**
 * The auth reducer
 */
const reducer = (state = initialState, action: AuthActionTypes): AuthState => {
  switch (action.type) {
    case LOAD_SESSION_SUCCESS:
      return {
        ...state,
        isSessionLoaded: true,
        token: action.token,
      };
    case LOAD_SESSION_FAILURE:
      return {
        ...state,
        isSessionLoaded: true,
      };
    case AUTH_REDIRECT_START:
      return {
        ...state,
        isRedirecting: true,
        redirectErrorMessage: '',
      };
    case AUTH_REDIRECT_SUCCESS:
      return {
        ...state,
        isRedirecting: false,
        redirectResponse: action.payload,
      };
    case AUTH_REDIRECT_FAILURE:
      return {
        ...state,
        isRedirecting: false,
        redirectErrorMessage: action.error.message,
      };
    case SIGN_IN_START:
      return {
        ...state,
        isSigningIn: true,
        signInErrorMessage: '',
      };
    case SIGN_IN_SUCCESS:
      return {
        ...state,
        isSigningIn: false,
        isAuthenticated: true,
        user: action.user,
        token: action.token,
      };
    case SIGN_IN_FAILURE:
      return {
        ...state,
        isSigningIn: false,
        signInErrorMessage: action.error.message,
      };
    case SIGN_OUT_SUCCESS:
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
