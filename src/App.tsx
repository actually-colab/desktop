import React from 'react';
import AceEditor from 'react-ace';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/ext-language_tools';
import './App.global.css';

import useKernel from './kernel/useKernel';
import { executeCode } from './kernel/jupyter';

const Editor = () => {
  const kernel = useKernel();
  const [code, setCode] = React.useState<string>('');
  const [output, setOutput] = React.useState<string[]>([]);

  const editorOptions = {
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
  };

  const execute = React.useCallback(async () => {
    if (kernel === null) {
      setOutput([]);
    } else {
      const ioOutput = await executeCode(kernel, code);

      setOutput(
        ioOutput
          .filter((msg) => msg.content.name === 'stdout')
          .map((msg) => msg.content.text as string)
      );
    }
  }, [code, kernel]);

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

      <button type="button" onClick={execute}>
        Execute
      </button>

      <p>{output.join('')}</p>
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
