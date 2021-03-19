import * as client from '@actually-colab/editor-client';

import { AuthActionTypes, AuthAsyncActionTypes, LOAD_SESSION, SIGN_IN, SIGN_OUT } from '../../types/redux/auth';
import { User } from '../../types/user';
import { _editor } from '.';

const signInStart = (): AuthActionTypes => ({
  type: SIGN_IN.START,
});

const signInSuccess = (user: User, sessionToken: string): AuthActionTypes => {
  localStorage.setItem('sessionToken', sessionToken);

  return {
    type: SIGN_IN.SUCCESS,
    user,
    sessionToken,
  };
};

const signInFailure = (errorMessage: string): AuthActionTypes => {
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
export const refreshSessionToken = (sessionToken: string): AuthAsyncActionTypes => async (dispatch) => {
  dispatch(signInStart());

  try {
    const res = await client.refreshSessionToken(sessionToken);

    console.log('Signed in', res);
    dispatch(signInSuccess(res.user, res.sessionToken));
  } catch (error) {
    console.error(error);
    dispatch(signInFailure(error.message));
  }
};

const loadSessionSuccess = (sessionToken: string): AuthActionTypes => ({
  type: LOAD_SESSION.SUCCESS,
  sessionToken,
});

const loadSessionFailure = (): AuthActionTypes => ({
  type: LOAD_SESSION.FAILURE,
});

/**
 * Try to load the saved session from storage
 */
export const loadSession = (): AuthAsyncActionTypes => async (dispatch) => {
  const sessionToken = localStorage.getItem('sessionToken');

  console.log('Local storage session', { sessionToken });

  if (sessionToken) {
    dispatch(loadSessionSuccess(sessionToken));
    dispatch(refreshSessionToken(sessionToken));
  } else {
    dispatch(loadSessionFailure());
  }
};

/**
 * Sign in with the google token
 */
export const googleSignIn = (idToken: string): AuthAsyncActionTypes => async (dispatch) => {
  dispatch(signInStart());

  try {
    const res = await client.loginWithGoogleIdToken(idToken);

    console.log('Signed in', res);
    dispatch(signInSuccess(res.user, res.sessionToken));
  } catch (error) {
    console.error(error);
    dispatch(signInFailure(error.message));
  }
};

const signOutSuccess = (): AuthActionTypes => ({
  type: SIGN_OUT.SUCCESS,
});

/**
 * Clear session information
 */
export const signOut = (): AuthAsyncActionTypes => async (dispatch) => {
  localStorage.removeItem('sessionToken');

  dispatch(signOutSuccess());
  dispatch(_editor.disconnectFromKernel());
};
