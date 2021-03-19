import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import ReduxThunk from 'redux-thunk';

import ReduxEditorClient from './middleware/ReduxEditorClient';
import ReduxKernel from './middleware/ReduxKernel';
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
export default createStore(
  reducers,
  composeWithDevTools(applyMiddleware(ReduxThunk, ReduxEditorClient(), ReduxKernel()))
);
