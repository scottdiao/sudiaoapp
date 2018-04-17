import React, { Component } from 'react';
import './css/foundation.css';
import './css/app.css';
import './css/spinner.css';
import { Switch, Route } from 'react-router-dom'
import Introduction from './Introduction'
import BuildingList from './BuildingList'
import Header from './Header'
import Main from './Main'
import {query_building_list} from "../api/Api";



class App extends Component {


  render() {
    return (
      <div className="container">
        <Header />
        <div className="spacer"/>
          <Switch>
              <Route path='/introduction' component={Introduction}/>
              <Route path='/list' component={BuildingList}/>
              <Route path='/' component={Main}/>
          </Switch>
      </div>
    );
  }
}

export default App;
