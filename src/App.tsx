import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import './App.global.css';
import store from './redux';
import { EditorPage } from './pages';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/" component={EditorPage} />
        </Switch>
      </Router>
    </Provider>
  );
}
