import { AuthActionTypes, AUTH_REDIRECT, LOAD_SESSION, SIGN_IN, SIGN_OUT } from '../types/redux/auth';
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
    case AUTH_REDIRECT.START:
      return {
        ...state,
        isRedirecting: true,
        redirectErrorMessage: '',
      };
    case AUTH_REDIRECT.SUCCESS:
      return {
        ...state,
        isRedirecting: false,
        redirectResponse: action.payload,
      };
    case AUTH_REDIRECT.FAILURE:
      return {
        ...state,
        isRedirecting: false,
        redirectErrorMessage: action.error.message,
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
