import React, { Component } from 'react';
import './css/foundation.css';
import './css/app.css';
import Dropzone from 'react-dropzone';
import {Row, Column, Colors, Button } from 'react-foundation';
import {testfunc, query_building_uri, query_building_file} from '../api/Api'
import ResultList from './ResultList';
import Chart from './Chart';

class Fileform extends React.Component {
  constructor() {
    super()
    this.state = { files: [],
      value: '',
      isLoading: false,
      result: [],
      chartData:{}
     }
    this.handleSubmit = this.handleSubmit.bind(this);
  }


async handleSubmit(event) {
    this.setState({result: []});
    event.preventDefault();
    const data = new FormData(event.target);
    console.log("uri: "+data.get('imageuri'))
    const file = this.state.files[0]
    data.append('file', file)
    this.setState({isLoading: true});
    let res = await query_building_file(data);
    this.setState({isLoading: false});

    // const state = this.state;
    // state.result=[];
    const labels = [];
    const probability = [];
    const result = [];

    {Object.keys(res).map(function(key) {
        console.log(" key"+key+"value"+res[key].label+res[key].probability);
        result.push(res[key].label+" "+res[key].probability);
        labels.push(res[key].label)
        probability.push(res[key].probability)
    })}


    const chartData = {
        labels:labels,
        datasets:[
            {
                label:"Probability",
                data: probability,
                backgroundColor:[
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                ]
            }
        ]
    }


    this.setState({result: result, chartData : chartData});
        console.log("chart data object len"+Object.keys(this.state.chartData).length+this.state.chartData)

  }


  onDrop(files) {
    console.log('ondrop')
    this.setState({
      files
    });
  }

  render() {

      const button = this.state.isLoading ? (
          <div className="lds-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
          </div>
      ) : (
          <button className="btn btn-outline-primary" type="submit">Analysis</button>
      );

      return <div align="center">
          <Row className="display">
              <Column medium={8} centerOnSmall>

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
                      <div>
                          {button}
                      </div>

                      <div className="spacer"/>
                      <Chart chartData={this.state.chartData} legendPosition="bottom"/>
                      <ResultList result={this.state.result} />
                  </form>
              </Column>
          </Row>
        </div>
      }


}

export default Fileform;
