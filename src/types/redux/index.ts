import { AuthState } from '../../redux/auth';
import { EditorState } from '../../redux/editor';
import { UIState } from '../../redux/ui';

/**
 * The type of the combined reducer
 */
export type ReduxState = {
  auth: AuthState;
  editor: EditorState;
  ui: UIState;
};
