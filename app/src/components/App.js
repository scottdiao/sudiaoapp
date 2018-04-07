import React, { Component } from 'react';
import './css/foundation.css';
import './css/app.css';
import { Switch, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Introduction from './Introduction'
import Header from './Header'
import Fileform from './Fileform';


class App extends Component {
  render() {
    return (
      <div align="center">
        <Header />
        <Link to="/build/introduction">Introduction</Link>
        <Switch>
          <Route path='/build/introduction' component={Introduction}/>
        </Switch>
        <div className="spacer"></div>
        <Fileform />
      </div>
    );
  }
}

export default App;
