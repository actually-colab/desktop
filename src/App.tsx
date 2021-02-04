import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import './App.global.css';
import { EditorPage } from './pages';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={EditorPage} />
      </Switch>
    </Router>
  );
}
