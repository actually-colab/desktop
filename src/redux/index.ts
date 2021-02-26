import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';

import auth, { AuthState } from './auth';
import editor, { EditorState } from './editor';
import ui, { UIState } from './ui';

/**
 * The type of the combined reducer
 */
export type ReduxState = {
  auth: AuthState;
  editor: EditorState;
  ui: UIState;
};

/**
 * The combined redux store
 */
export const reducers = combineReducers({
  auth,
  editor,
  ui,
});

/**
 * The combined redux store with support for async actions
 */
export default createStore(reducers, applyMiddleware(ReduxThunk));
