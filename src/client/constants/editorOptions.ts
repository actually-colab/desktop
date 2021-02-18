import { IAceOptions } from 'react-ace';

const editorOptions: IAceOptions = {
  showFoldWidgets: false,
  printMargin: false,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
};

export const editorOptionsActive: IAceOptions = {
  ...editorOptions,
  readOnly: false,
  highlightActiveLine: true,
  highlightGutterLine: true,
};

export const editorOptionsInactive: IAceOptions = {
  ...editorOptions,
  readOnly: true,
  highlightActiveLine: false,
  highlightGutterLine: false,
};
