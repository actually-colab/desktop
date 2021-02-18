import fixPath from 'fix-path';
import React from 'react';
import { render } from 'react-dom';
import App from './App';

fixPath();

render(<App />, document.getElementById('root'));
