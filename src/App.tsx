import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';

const Editor = () => {
  return <div />;
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
