import { IAceOptions } from 'react-ace';

const editorOptions: IAceOptions = {
  showFoldWidgets: false,
  printMargin: false,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
};

/**
 * Editor options to use when the cell is being edited
 */
export const editorOptionsActive: IAceOptions = {
  ...editorOptions,
  readOnly: false,
  highlightActiveLine: true,
  highlightGutterLine: true,
};

/**
 * Editor options to use when the cell is inactive
 */
export const editorOptionsInactive: IAceOptions = {
  ...editorOptions,
  readOnly: true,
  highlightActiveLine: false,
  highlightGutterLine: false,
};
