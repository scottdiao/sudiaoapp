import React from 'react'
import blocks from './blocks.svg';
import logo from './logo.svg';

const Header = () => (
  <div className="App">
    <header className="App-header">
        <div className="spacer"/>
      <img src={blocks} className="App-logo" alt="logo" />
      <h1 className="App-title">Building Recognition Application</h1>
    </header>
  </div>
)

export default Header
