import { Router } from 'react-router';
import { hashHistory as history } from 'react-router-dom';
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
