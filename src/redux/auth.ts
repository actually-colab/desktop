import { AuthActionTypes, LOAD_SESSION, SIGN_IN, SIGN_OUT } from '../types/redux/auth';
import { User } from '../types/user';

/**
 * The auth redux state
 */
export interface AuthState {
  /**
   * If the session information has been loaded from local storage yet
   */
  isSessionLoaded: boolean;

  /**
   * If the editor is currently signing in
   */
  isSigningIn: boolean;
  /**
   * An error message if sign in fails
   */
  signInErrorMessage: string;

  /**
   * If the user is currently authenticated
   */
  isAuthenticated: boolean;
  /**
   * The user if the user is signed in, otherwise null
   */
  user: User | null;
  /**
   * The session token if the user is signed in, otherwise the empty string
   */
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
