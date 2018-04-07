import React, { Component } from 'react';
import './css/foundation.css';
import './css/app.css';
import Dropzone from 'react-dropzone';
import {Row, Column, Colors, Button } from 'react-foundation';
import {testfunc, query_building_uri, query_building_file} from '../api/Api'
import Introduction from "./Introduction";
import { Switch, Route } from 'react-router-dom'


function ResultList(props) {
    const results = props.result;
    const listResult = results.map((result) =>
        <li key={result.toString()}>{result}</li>
    );
    return (
        <ul>{listResult}</ul>
    );
}



class Fileform extends React.Component {
  constructor() {
    super()
    this.state = { files: [],
      value: '',
      isLoading: false,
      result: []
     }
    this.handleSubmit = this.handleSubmit.bind(this);
  }


async handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    console.log("uri: "+data.get('imageuri'))
    const file = this.state.files[0]
    data.append('file', file)
    this.setState({isLoading: true});
    let res = await query_building_file(data);
    this.setState({isLoading: false});

    const state = this.state;
    state.result=[];
    {Object.keys(res).map(function(key) {
        console.log(" key"+key+"value"+res[key].label+res[key].probability);
        state.result.push(res[key].label+" "+res[key].probability);
    })}


    this.setState(state);
  }


  onDrop(files) {
    console.log('ondrop')
    this.setState({
      files
    });
  }

  render() {

      const button = this.state.isLoading ? (
          <div>loading</div>
      ) : (
          <button className="btn btn-outline-primary" type="submit">Analysis</button>
      );

      return <div align="center">
          <Row className="display">
              <Column medium={8} centerOnSmall>
                  <ul className="nav nav-tabs">
                      <li className="nav-item">
                          <a className="nav-link active" href="/file">Image Upload</a>
                      </li>
                      <li className="nav-item">
                          <a className="nav-link" href="/fileuri">Image uri</a>
                      </li>
                  </ul>
                  <Switch>
                      <Route path='/fileupload' component={Introduction}/>
                      <Route path='/fileupuri' component={Introduction}/>
                  </Switch>
                  <form onSubmit={this.handleSubmit.bind(this)} name="dropzone" enctype="multipart/form-data">
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
                      Image URI: <input type="text" name="imageuri"/>
                      <div>
                          {button}
                      {/*{*/}
                          {/*if(this.state.isLoading){*/}
                            {/*<div>Loading</div>*/}
                          {/*}else{*/}
                              {/*<button className="button" type="submit">Analysis</button>*/}
                          {/*}*/}
                      {/*}*/}
                      </div>

                      <div className="spacer"></div>
                      Result:  <ResultList result={this.state.result} />
                  </form>
              </Column>
          </Row>
        </div>
      }


}

export default Fileform;
