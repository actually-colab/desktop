import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';

import auth from './auth';
import editor from './editor';
import ui from './ui';

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
