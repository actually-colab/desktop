import React from 'react';
import AceEditor from 'react-ace';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/ext-language_tools';

const Editor = () => {
  const [code1, setCode1] = React.useState<string>('');
  const [code2, setCode2] = React.useState<string>('');

  const editorOptions = {
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
  };

  return (
    <div>
      <AceEditor
        name="ace-editor-1"
        mode="python"
        theme="xcode"
        value={code1}
        onChange={(newValue) => setCode1(newValue)}
        setOptions={editorOptions}
      />
      <AceEditor
        name="ace-editor-2"
        mode="python"
        theme="xcode"
        value={code2}
        onChange={(newValue) => setCode2(newValue)}
        setOptions={editorOptions}
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Editor} />
      </Switch>
    </Router>
  );
}
