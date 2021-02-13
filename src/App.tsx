import { ipcRenderer } from 'electron';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { StyleSheet, css } from 'aphrodite';

import './App.global.less';
import store from './redux';
import { EditorPage } from './pages';
import { extractLoginData } from './utils/redirect';

ipcRenderer.on('login-success', (event, data: { url: string }) => {
  const loginResponse = extractLoginData(data.url);

  console.log(loginResponse);
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
});

export default function App() {
  return (
    <div className={css(styles.container)}>
      <Provider store={store}>
        <Router>
          <Switch>
            <Route path="/" component={EditorPage} />
          </Switch>
        </Router>
      </Provider>
    </div>
  );
}
