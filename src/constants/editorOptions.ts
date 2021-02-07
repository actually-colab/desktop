const editorOptions = {
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
};

export const editorOptionsActive = {
  ...editorOptions,
  readOnly: false,
  highlightActiveLine: true,
  highlightGutterLine: true,
};

export const editorOptionsInactive = {
  ...editorOptions,
  readOnly: true,
  highlightActiveLine: false,
  highlightGutterLine: false,
};
