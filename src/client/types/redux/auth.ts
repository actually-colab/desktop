import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { LoginRedirectResponse } from '../../utils/redirect';
import { User } from '../user';

export const LOAD_SESSION_SUCCESS = 'LOAD_SESSION_SUCCESS';
export const LOAD_SESSION_FAILURE = 'LOAD_SESSION_FAILURE';
export const AUTH_REDIRECT_START = 'AUTH_REDIRECT_START';
export const AUTH_REDIRECT_SUCCESS = 'AUTH_REDIRECT_SUCCESS';
export const AUTH_REDIRECT_FAILURE = 'AUTH_REDIRECT_FAILURE';
export const SIGN_IN_START = 'SIGN_IN_START';
export const SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS';
export const SIGN_IN_FAILURE = 'SIGN_IN_FAILURE';
export const SIGN_OUT_SUCCESS = 'SIGN_OUT';

type ActionError = {
  error: {
    message: string;
  };
};

type LoadSessionSuccessAction = {
  type: typeof LOAD_SESSION_SUCCESS;
  token: string;
};

type LoadSessionFailureAction = {
  type: typeof LOAD_SESSION_FAILURE;
};

type AuthRedirectStartAction = {
  type: typeof AUTH_REDIRECT_START;
};

type AuthRedirectSuccessAction = {
  type: typeof AUTH_REDIRECT_SUCCESS;
  payload: LoginRedirectResponse;
};

type AuthRedirectFailureAction = {
  type: typeof AUTH_REDIRECT_FAILURE;
} & ActionError;

type SignInStartAction = {
  type: typeof SIGN_IN_START;
};

type SignInSuccessAction = {
  type: typeof SIGN_IN_SUCCESS;
  user: User;
  token: string;
};

type SignInFailureAction = {
  type: typeof SIGN_IN_FAILURE;
} & ActionError;

type SignOutSuccessAction = {
  type: typeof SIGN_OUT_SUCCESS;
};

export type AuthActionTypes =
  | LoadSessionSuccessAction
  | LoadSessionFailureAction
  | AuthRedirectStartAction
  | AuthRedirectSuccessAction
  | AuthRedirectFailureAction
  | SignInStartAction
  | SignInSuccessAction
  | SignInFailureAction
  | SignOutSuccessAction;

export type AuthAsyncActionTypes = ThunkAction<void, unknown, unknown, Action<string>>;
