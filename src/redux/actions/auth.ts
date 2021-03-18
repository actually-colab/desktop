import * as client from '@actually-colab/editor-client';

import { AuthActionTypes, AuthAsyncActionTypes, LOAD_SESSION, SIGN_IN, SIGN_OUT } from '../../types/redux/auth';
import { User } from '../../types/user';

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

  try {
    try {
      const res = await client.login(token);

      console.log('Signed in', res);
      dispatch(signInSuccess(res.user, res.sessionToken));
    } catch (_) {
      const devRes = await client.devLogin('jeff@test.com', 'Jeff Taylor-Chang');

      console.warn('SIGNED IN FOR DEVELOPMENT ONLY. REMOVE ONCE SESSION REFRESH IS READY.');
      dispatch(signInSuccess(devRes.user, devRes.sessionToken));
    }
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

/**
 * Sign in with the google token
 */
export const googleSignIn = (token: string): AuthAsyncActionTypes => async (dispatch) => {
  dispatch(signIn(token));
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
