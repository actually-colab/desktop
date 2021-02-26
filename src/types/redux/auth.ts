import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { User } from '../user';

export const LOAD_SESSION = {
  SUCCESS: 'LOAD_SESSION_SUCCESS',
  FAILURE: 'LOAD_SESSION_FAILURE',
} as const;
export const SIGN_IN = {
  START: 'SIGN_IN_START',
  SUCCESS: 'SIGN_IN_SUCCESS',
  FAILURE: 'SIGN_IN_FAILURE',
} as const;
export const SIGN_OUT = {
  SUCCESS: 'SIGN_OUT',
} as const;

type ActionError = {
  error: {
    message: string;
  };
};

type LoadSessionSuccessAction = {
  type: typeof LOAD_SESSION.SUCCESS;
  token: string;
};

type LoadSessionFailureAction = {
  type: typeof LOAD_SESSION.FAILURE;
};

type SignInStartAction = {
  type: typeof SIGN_IN.START;
};

type SignInSuccessAction = {
  type: typeof SIGN_IN.SUCCESS;
  user: User;
  token: string;
};

type SignInFailureAction = {
  type: typeof SIGN_IN.FAILURE;
} & ActionError;

type SignOutSuccessAction = {
  type: typeof SIGN_OUT.SUCCESS;
};

/**
 * An action for manipulating the auth redux store
 */
export type AuthActionTypes =
  | LoadSessionSuccessAction
  | LoadSessionFailureAction
  | SignInStartAction
  | SignInSuccessAction
  | SignInFailureAction
  | SignOutSuccessAction;

/**
 * An asynchronous action for manipulating the auth redux store
 */
export type AuthAsyncActionTypes = ThunkAction<void, unknown, unknown, Action<string>>;