import {
  AuthActionTypes,
  AuthAsyncActionTypes,
  AUTH_REDIRECT_FAILURE,
  AUTH_REDIRECT_START,
  AUTH_REDIRECT_SUCCESS,
  LOAD_SESSION_FAILURE,
  LOAD_SESSION_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_IN_START,
  SIGN_IN_SUCCESS,
  SIGN_OUT_SUCCESS,
} from '../../types/redux/auth';
import { User } from '../../types/user';
import { displayError } from '../../utils/ipc';
import { LoginRedirectResponse, openLoginPage } from '../../utils/redirect';

const loadSessionSuccess = (token: string): AuthActionTypes => ({
  type: LOAD_SESSION_SUCCESS,
  token,
});

const loadSessionFailure = (): AuthActionTypes => ({
  type: LOAD_SESSION_FAILURE,
});

/**
 * Try to load the saved session from storage
 */
export const loadSession = (): AuthAsyncActionTypes => async (dispatch) => {
  const token = localStorage.getItem('token');

  console.log('Local storage session', { token });

  if (token) {
    dispatch(loadSessionSuccess(token));

    // TODO: sign in
  } else {
    dispatch(loadSessionFailure());
  }
};

const authRedirectStart = (): AuthActionTypes => ({
  type: AUTH_REDIRECT_START,
});

const authRedirectSuccess = (payload: LoginRedirectResponse): AuthActionTypes => ({
  type: AUTH_REDIRECT_SUCCESS,
  payload,
});

/**
 * Handle failure of auth redirect
 */
export const authRedirectFailure = (errorMessage: string): AuthActionTypes => {
  displayError(errorMessage);

  return {
    type: AUTH_REDIRECT_FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

/**
 * Trigger an auth redirect page to open
 */
export const openAuthRedirect = (): AuthAsyncActionTypes => async (dispatch) => {
  dispatch(authRedirectStart());

  openLoginPage();
};

const signInStart = (): AuthActionTypes => ({
  type: SIGN_IN_START,
});

const signInSuccess = (user: User, token: string): AuthActionTypes => ({
  type: SIGN_IN_SUCCESS,
  user,
  token,
});

const signInFailure = (errorMessage: string): AuthActionTypes => {
  displayError(errorMessage);

  return {
    type: SIGN_IN_FAILURE,
    error: {
      message: errorMessage,
    },
  };
};

/**
 * Sign in with the auth redirect payload
 */
export const authRedirectSignIn = (payload: LoginRedirectResponse): AuthAsyncActionTypes => async (dispatch) => {
  dispatch(authRedirectSuccess(payload));

  // TODO: sign in
};

/**
 * Sign in with the given session token
 */
export const signIn = (token: string): AuthAsyncActionTypes => async (dispatch) => {
  dispatch(signInStart());

  // TODO: sign in
};

const signOutSuccess = (): AuthActionTypes => ({
  type: SIGN_OUT_SUCCESS,
});

/**
 * Clear session information
 */
export const signOut = (): AuthAsyncActionTypes => async (dispatch) => {
  localStorage.removeItem('token');

  dispatch(signOutSuccess());
};
