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
    /**
     * A session is successfully loaded from local storage
     */
    case LOAD_SESSION.SUCCESS:
      return {
        ...state,
        isSessionLoaded: true,
        token: action.token,
      };
    /**
     * A session was not stored in local storage
     */
    case LOAD_SESSION.FAILURE:
      return {
        ...state,
        isSessionLoaded: true,
      };
    /**
     * The user has started signing in
     */
    case SIGN_IN.START:
      return {
        ...state,
        isSigningIn: true,
        signInErrorMessage: '',
      };
    /**
     * The user has signed in successfully
     */
    case SIGN_IN.SUCCESS:
      return {
        ...state,
        isSigningIn: false,
        isAuthenticated: true,
        user: action.user,
        token: action.token,
      };
    /**
     * The user failed to sign in
     */
    case SIGN_IN.FAILURE:
      return {
        ...state,
        isSigningIn: false,
        signInErrorMessage: action.error.message,
      };
    /**
     * The user has signed out successfully
     */
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
