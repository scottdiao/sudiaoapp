import React, { Component } from 'react';
import './css/foundation.css';
import './css/app.css';
import { Switch, Route } from 'react-router-dom'
import Dropzone from 'react-dropzone';
import {Row, Column, Colors, Button } from 'react-foundation';
import { Link } from 'react-router-dom'
import Introduction from './Introduction'
import Header from './Header'
import fetch from 'isomorphic-fetch';



class Fileform extends React.Component {
  constructor() {
    super()
    this.state = { files: [],
      value: ''
     }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    console.log("uri: "+data.get('imageuri'))
    fetch('http://localhost:5000/download',{
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uri: data.get('imageuri'),
      })
    });
  }


  onDrop(files) {
    console.log('ondrop')
    this.setState({
      files
    });
  }

  render() {
    return (
      <div align="center">
        <Row className="display">
          <Column medium={12} centerOnSmall>
            <form onSubmit={this.handleSubmit.bind(this)} name="dropzone">
              <div className="dropzone">
                <Dropzone onDrop={this.onDrop.bind(this)}>
                  <p>Try dropping some files here, or click to select files to upload.</p>
                </Dropzone>
                Dropped files
                <ul>
                  {
                    this.state.files.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
                  }
                </ul>
              </div>
              <div className="spacer"></div>
               Image URI: <input type="text" name="imageuri"></input>
              <button className="button" type="submit">Analysis</button>
            </form>
          </Column>
        </Row>
      </div>
    );
  }
}


class App extends Component {
  render() {
    return (
      <div>
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
