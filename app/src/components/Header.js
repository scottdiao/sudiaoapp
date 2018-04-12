import React from 'react'
import blocks from './blocks.svg';

const Header = () => (
  <div className="App">
    <header className="App-header">
        <div className="spacer"/>
      <img src={blocks} className="App-logo" alt="logo" />
      <h1 className="App-title">Building Recognition Application</h1>
    </header>
      {/*<div className="row justify-content-center">*/}
          {/*<div className="col-10" align="center">*/}
              <nav className="navbar navbar-expand-lg navbar-light bg-light">
                  <a className="navbar-brand" href="/">Home</a>
                  <button className="navbar-toggler" type="button" data-toggle="collapse"
                          data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false"
                          aria-label="Toggle navigation">
                      <span className="navbar-toggler-icon"></span>
                  </button>
                  <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                      <div className="navbar-nav">
                          <a className="nav-item nav-link active" href="/introduction">Introduction <span
                              className="sr-only">(current)</span></a>
                          <a className="nav-item nav-link" href="/list">Building List</a>
                      </div>
                  </div>
              </nav>
          {/*</div>*/}
      {/*</div>*/}
  </div>
)

export default Header
