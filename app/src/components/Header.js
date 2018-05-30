import React from 'react'
import blocks from './blocks.svg';

const Header = () => (
  <div className="App">
    <header className="App-header">
        <div className="spacer"/>
      <img src={blocks} className="App-logo" alt="logo" />
      <div className="spacerTiny"/>
      <h1 className="App-title">Building Recognition Application</h1>
    </header>
      <nav className="navColor navbar navbar-expand-lg navbar-light bg-light radius shadow">
          <a className="navbar-brand" href="/"><i class="fas fa-home"></i> Home</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                  aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav mr-auto">
                  <li className="nav-item">
                      <a className="nav-link" href="/introduction"><i class="fas fa-question-circle"></i>  Introduction <span className="sr-only">(current)</span></a>
                  </li>
                  <li className="nav-item">
                      <a className="nav-link" href="/list"><i class="fas fa-building"></i>  Building List</a>
                  </li>
              </ul>
          </div>
      </nav>
  </div>

)

export default Header
