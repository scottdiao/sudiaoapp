import React, { Component } from 'react';
import './css/foundation.css';
import './css/app.css';
import './css/spinner.css';
import { Switch, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Introduction from './Introduction'
import Header from './Header'
import Fileform from './Fileform';
import Uriform from './Uriform';



class App extends Component {
  render() {
    return (
      <div className="container">
        <Header />
        <div className="spacer"/>
        <div className="row">
            <div className="col" align="center">
                <Link to="/introduction">Introduction</Link>
            </div>
        </div>
          <Switch>
              <Route path='/introduction' component={Introduction}/>
          </Switch>
          <div className="spacer"/>
          <div className="row justify-content-center" >
              <div className="col-8" align="center">
                  <ul className="nav nav-tabs nav-fill" id="myTab" role="tablist">
                      <li className="nav-item">
                          <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab"
                             aria-controls="home" aria-selected="true">Image Upload</a>
                      </li>
                      <li className="nav-item">
                          <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab"
                             aria-controls="profile" aria-selected="false">Image uri</a>
                      </li>
                  </ul>
              </div>
          </div>
          <div className="row" >
              <div className="col" align="center">
                  <div className="spacer"/>
                  <div className="tab-content" id="myTabContent">
                      <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab"><Fileform /></div>
                      <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab"><Uriform /></div>
                  </div>
              </div>
          </div>

      </div>
    );
  }
}

export default App;
