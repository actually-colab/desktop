import type { DUser } from '@actually-colab/editor-types';

import { AuthActionTypes, AuthAsyncActionTypes, LOAD_SESSION, SIGN_IN, SIGN_OUT } from '../../types/redux/auth';
import { LOG_LEVEL } from '../../constants/logging';
import { SessionTokenStorage } from '../../utils/storage';
import { _editor } from '.';

const signInStart = (tokenType: 'id' | 'session', token: string): AuthActionTypes => ({
  type: SIGN_IN.START,
  tokenType,
  token,
});

/**
 * Successfully signed in
 */
export const signInSuccess = (user: DUser, sessionToken: string): AuthActionTypes => {
  SessionTokenStorage.set(sessionToken);

  return {
    type: SIGN_IN.SUCCESS,
    user,
    sessionToken,
  };
};

/**
 * Failed to sign in
 */
export const signInFailure = (errorMessage: string = 'Unknown Error'): AuthActionTypes => {
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
 * Intended for signing in from cached session
 */
export const refreshSessionToken = (sessionToken: string): AuthAsyncActionTypes => async (dispatch) => {
  dispatch(signInStart('session', sessionToken));
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
  const sessionToken = SessionTokenStorage.get();

  if (LOG_LEVEL === 'verbose') {
    console.log('Local storage session', { sessionToken });
  }

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
  dispatch(signInStart('id', idToken));
};

const signOutSuccess = (): AuthActionTypes => ({
  type: SIGN_OUT.SUCCESS,
});

/**
 * Clear session information
 */
export const signOut = (): AuthAsyncActionTypes => async (dispatch) => {
  SessionTokenStorage.remove();

  dispatch(signOutSuccess());
  dispatch(_editor.disconnectFromKernel());
};
