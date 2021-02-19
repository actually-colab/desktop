import { devLogin } from '@actually-colab/editor-client';

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

const signInStart = (): AuthActionTypes => ({
  type: SIGN_IN_START,
});

const signInSuccess = (user: User, token: string): AuthActionTypes => {
  localStorage.setItem('token', token);

  return {
    type: SIGN_IN_SUCCESS,
    user,
    token,
  };
};

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
 * Sign in with the given session token
 *
 * Intended for signing in from cached session, or signing in from an ID token
 */
export const signIn = (token: string): AuthAsyncActionTypes => async (dispatch) => {
  dispatch(signInStart());

  // TODO: sign in
  try {
    console.log(devLogin);
    // const user = await devLogin('jeff@test.com', 'Jeff Taylor-Chang');

    dispatch(
      signInSuccess(
        {
          uid: 0,
          name: 'Jeff Taylor-Chang',
          email: 'jeff@test.com',
        },
        'TEST'
      )
    );
  } catch (error) {
    console.error(error);
    dispatch(signInFailure(error.message));
  }
};

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
    dispatch(signIn(token));
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

/**
 * Sign in with the auth redirect payload
 */
export const authRedirectSignIn = (payload: LoginRedirectResponse): AuthAsyncActionTypes => async (dispatch) => {
  dispatch(authRedirectSuccess(payload));

  // TODO: sign in
  dispatch(signIn(payload.token));
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
