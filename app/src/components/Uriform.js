import React, { Component } from 'react';
import './css/foundation.css';
import './css/app.css';
import {Row, Column } from 'react-foundation';
import {testfunc, query_building_uri, query_building_file} from '../api/Api'
import ResultList from './ResultList';
import Chart from './Chart';

class Uriform extends React.Component {
  constructor() {
    super()
    this.state = {
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
    this.setState({isLoading: true});
    let res = await query_building_uri(data);
    this.setState({isLoading: false});

    const state = this.state;
    const labels = [];
    const probability = [];
    const result = [];
    state.result=[];
    {Object.keys(res).map(function(key) {
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
                      Image URI: <input type="text" name="imageuri"/>
                      <div>
                          {button}
                      </div>

                      <div className="spacer"></div>
                      <Chart chartData={this.state.chartData} legendPosition="bottom"/>
                      <ResultList result={this.state.result} />
                  </form>
              </Column>
          </Row>
        </div>
      }


}

export default Uriform;
