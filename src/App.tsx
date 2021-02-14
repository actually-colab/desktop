import { ipcRenderer } from 'electron';
import React from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, useHistory, useLocation } from 'react-router-dom';
import { StyleSheet, css } from 'aphrodite';

import './App.global.less';
import store, { ReduxState } from './redux';
import { _auth } from './redux/actions';
import { extractLoginData } from './utils/redirect';
import { AuthPage, EditorPage } from './pages';

ipcRenderer.on('login-success', (_, data: { url: string }) => {
  const loginResponse = extractLoginData(data.url);

  console.log(loginResponse);
});

const EntryPoint: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const isSessionLoaded = useSelector((state: ReduxState) => state.auth.isSessionLoaded);
  const isAuthenticated = useSelector((state: ReduxState) => state.auth.isAuthenticated);

  const dispatch = useDispatch();
  const dispatchLoadSession = React.useCallback(() => dispatch(_auth.loadSession()), [dispatch]);

  React.useEffect(() => {
    if (!isSessionLoaded) {
      dispatchLoadSession();
    }
  }, [dispatchLoadSession, isSessionLoaded]);

  React.useEffect(() => {
    if (isSessionLoaded && !isAuthenticated && location.pathname !== '/auth') {
      history.push('/auth');
    } else if (isAuthenticated && location.pathname === '/auth') {
      history.push('/');
    }
  }, [history, isAuthenticated, isSessionLoaded, location.pathname]);

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={EditorPage} />
    </Switch>
  );
};

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
          <EntryPoint />
        </Router>
      </Provider>
    </div>
  );
}
