import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';

import editor, { EditorState } from './editor';

export type ReduxState = {
  editor: EditorState;
};

export const reducers = combineReducers({
  editor,
});

export default createStore(reducers, applyMiddleware(ReduxThunk));
