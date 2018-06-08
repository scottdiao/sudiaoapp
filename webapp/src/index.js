// You can choose your kind of history here (e.g. browserHistory)
import { Router } from 'react-router';
import { hashHistory as history } from 'react-router-dom';
// Your routes.js file
import App from './components/App'
import React from 'react';
import { BrowserRouter } from 'react-router-dom'
import ReactDOM from 'react-dom';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
