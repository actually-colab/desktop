import { devLogin } from '@actually-colab/editor-client';

import {
  AuthActionTypes,
  AuthAsyncActionTypes,
  AUTH_REDIRECT,
  LOAD_SESSION,
  SIGN_IN,
  SIGN_OUT,
} from '../../types/redux/auth';
import { User } from '../../types/user';
import { displayError } from '../../utils/ipc';
import { LoginRedirectResponse, openLoginPage } from '../../utils/redirect';

const signInStart = (): AuthActionTypes => ({
  type: SIGN_IN.START,
});

const signInSuccess = (user: User, token: string): AuthActionTypes => {
  localStorage.setItem('token', token);

  return {
    type: SIGN_IN.SUCCESS,
    user,
    token,
  };
};

const signInFailure = (errorMessage: string): AuthActionTypes => {
  displayError(errorMessage);

  return {
    type: SIGN_IN.FAILURE,
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
    // const res = await devLogin('jeff@test.com', 'Jeff Taylor-Chang');
    const res: { user: User; sessionToken: string } = {
      user: {
        uid: 0,
        name: 'Jeff Taylor-Chang',
        email: 'jeff@test.com',
      },
      sessionToken: 'TEST',
    };

    console.log('Signed in', res);

    dispatch(signInSuccess(res.user, res.sessionToken));
  } catch (error) {
    console.error(error);
    dispatch(signInFailure(error.message));
  }
};

const loadSessionSuccess = (token: string): AuthActionTypes => ({
  type: LOAD_SESSION.SUCCESS,
  token,
});

const loadSessionFailure = (): AuthActionTypes => ({
  type: LOAD_SESSION.FAILURE,
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
  type: AUTH_REDIRECT.START,
});

const authRedirectSuccess = (payload: LoginRedirectResponse): AuthActionTypes => ({
  type: AUTH_REDIRECT.SUCCESS,
  payload,
});

/**
 * Handle failure of auth redirect
 */
export const authRedirectFailure = (errorMessage: string): AuthActionTypes => {
  displayError(errorMessage);

  return {
    type: AUTH_REDIRECT.FAILURE,
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
  type: SIGN_OUT.SUCCESS,
});

/**
 * Clear session information
 */
export const signOut = (): AuthAsyncActionTypes => async (dispatch) => {
  localStorage.removeItem('token');

  dispatch(signOutSuccess());
};
