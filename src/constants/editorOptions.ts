import { IAceOptions } from 'react-ace';

const editorOptions: IAceOptions = {
  showFoldWidgets: false,
  printMargin: false,
  highlightActiveLine: false,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
};

export const editorOptionsActive: IAceOptions = {
  ...editorOptions,
  readOnly: false,
  highlightGutterLine: true,
};

export const editorOptionsInactive: IAceOptions = {
  ...editorOptions,
  readOnly: true,
  highlightGutterLine: false,
};
