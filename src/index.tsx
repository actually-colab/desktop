import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';

import App from './App';
import reportWebVitals from './reportWebVitals';

if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN && process.env.REACT_APP_SENTRY_RELEASE) {
  // Initialize Sentry
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    release: process.env.REACT_APP_SENTRY_RELEASE,
    tracesSampleRate: 0,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
