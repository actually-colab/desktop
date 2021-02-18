import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';

import auth, { AuthState } from './auth';
import editor, { EditorState } from './editor';

export type ReduxState = {
  auth: AuthState;
  editor: EditorState;
};

export const reducers = combineReducers({
  auth,
  editor,
});

export default createStore(reducers, applyMiddleware(ReduxThunk));
