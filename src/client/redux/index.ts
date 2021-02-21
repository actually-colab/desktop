import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';

import auth, { AuthState } from './auth';
import editor, { EditorState } from './editor';

/**
 * The type of the combined reducer
 */
export type ReduxState = {
  auth: AuthState;
  editor: EditorState;
};

/**
 * The combined redux store
 */
export const reducers = combineReducers({
  auth,
  editor,
});

/**
 * The combined redux store with support for async actions
 */
export default createStore(reducers, applyMiddleware(ReduxThunk));
