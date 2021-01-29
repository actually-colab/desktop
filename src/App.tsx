import React from 'react';
import AceEditor from 'react-ace';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/ext-language_tools';

const Editor = () => {
  const [code, setCode] = React.useState<string>('');

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
        value={code}
        onChange={(newValue) => setCode(newValue)}
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
