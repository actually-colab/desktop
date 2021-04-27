import { AuthActionTypes } from '../../types/redux/auth';
import { EditorActionTypes } from '../../types/redux/editor';
import { UIActionTypes } from '../../types/redux/ui';
import * as _auth from './auth.actions';
import * as _editor from './editor.actions';
import * as _ui from './ui.actions';

export type ReduxActions = AuthActionTypes | EditorActionTypes | UIActionTypes;

export { _auth, _editor, _ui };
