import React from 'react';
import './css/foundation.css';
import './css/app.css';
import {query_building_uri} from '../api/Api'
import Result from './Result';
import ErrorMessage from './ErrorMessage'

class Uriform extends React.Component {
  constructor() {
    super()
    this.state = {
      isLoading: false,
      error: {
          hasError:false,
          errorMes:""
      },
      chartData:{},
      resultList:{}
     }
    this.handleSubmit = this.handleSubmit.bind(this);
  }


async handleSubmit(event) {
    this.setState({error: {
            hasError:false,
            errorMes:""
        }});
    event.preventDefault();
    const data = new FormData(event.target);
    const uri = data.get('imageuri');
    console.log("uri: "+data.get('imageuri'))
    if(typeof(uri) === 'undefined' || uri === ''){
        this.setState({error: {
                hasError:true,
                errorMes:"The uri field is blank"
            }});
        return
    }
    this.setState({isLoading: true});
    let res = await query_building_uri(data);
    this.setState({isLoading: false});
    if(typeof(res) === 'undefined' || res == null){
        this.setState({error: {
                hasError:true,
                errorMes:"Can not resolve this image uri"
            }});
        return
    }
    const labels = [];
    const probability = [];
    const resultList = {};
    {Object.keys(res).map(function(key) {
        const detail = {
            alias:res[key].alias,
            place_id:res[key].place_id
        }
        resultList[res[key].label]=detail;
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
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ]
            }
        ]
    };
    this.setState({resultList: resultList, chartData : chartData});
  }


  render() {

      const button = this.state.isLoading ? (
          <div className="lds-ring">
              <div/>
              <div/>
              <div/>
              <div/>
          </div>
      ) : (
          <button className="btn btn-outline-primary" type="submit">Analysis</button>
      );

      const result = this.state.isLoading ? (
          <div/>
      ) : (
          <Result resultList={this.state.resultList} chartData={this.state.chartData} uri={true} />
      );

      return <div>
              <div className="col-lg-8 col-sm-12 align-self-center" align="center">
                <ErrorMessage error={this.state.error} />
              </div>
              <div className="col-lg-8 col-sm-12 align-self-center" >
                  <form onSubmit={this.handleSubmit.bind(this)}>
                      Image URI: <input type="text" name="imageuri"/>
                      <div className="spacerSmall"/>
                      <div>
                          {button}
                      </div>
                      <div className="spacer"/>
                  </form>
              </div>
          
          
              <div className="col-12 align-self-center" >
                  {result}
              </div>
        </div>
      }


}

export default Uriform;
