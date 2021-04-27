import { AuthState } from '../../redux/auth.reducer';
import { EditorState } from '../../redux/editor.reducer';
import { UIState } from '../../redux/ui.reducer';

/**
 * The type of the combined reducer
 */
export type ReduxState = {
  auth: AuthState;
  editor: EditorState;
  ui: UIState;
};
