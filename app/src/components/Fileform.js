import React from 'react';
import './css/foundation.css';
import './css/app.css';
import Dropzone from 'react-dropzone';
import {query_building_file} from '../api/Api'
import Result from './Result';
import ErrorMessage from './ErrorMessage'

class Fileform extends React.Component {
  constructor() {
    super()
    this.state = { files: [],
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
    const file = this.state.files[0]
    if(typeof(file) === 'undefined' || file === null){
        this.setState({error: {
                hasError:true,
                errorMes:"No image to upload"
            }});
        return
    }
    data.append('file', file)
    this.setState({isLoading: true});
    let res = await query_building_file(data);
    this.setState({isLoading: false});
    if(typeof(res) === 'undefined' || res === null){
        this.setState({error: {
                hasError:true,
                errorMes:"Can not resolve this image uri"
            }});
        return
    }
    const labels = [];
    const probability = [];
    const resultList = {};

    {
        Object.keys(res).map(function (key) {
            const detail = {
                alias:res[key].alias,
                place_id:res[key].place_id
            }
            resultList[res[key].label]=detail;
            // result.push(res[key].label + " " + res[key].probability);
            labels.push(res[key].label);
            probability.push(res[key].probability);
        })
    }

    console.log(JSON.stringify(resultList));

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Probability",
                data: probability,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                ]
            }
        ]
    }
    this.setState({resultList: resultList, chartData : chartData});

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
              <div/>
              <div/>
              <div/>
              <div/>
          </div>
      ) : (
          <button className="btn btn-outline-primary" type="submit">Analysis</button>
      );


      return   <div>
                <ErrorMessage error={this.state.error} />
                <div className="row justify-content-center">
                  <div className="col-6" align="center">
                      <form onSubmit={this.handleSubmit.bind(this)} name="dropzone" encType="multipart/form-data">
                          <div className="dropzone">
                              <Dropzone onDrop={this.onDrop.bind(this)}>
                                  <p>Try dropping some files here, or click to select files to upload.</p>
                              </Dropzone>
                              Dropped files
                              <div className="spacer"/>
                              <ul className="list-group">
                                  {
                                      this.state.files.map(f => <li className="list-group-item" key={f.name}>{f.name} - {f.size} bytes</li>)
                                  }
                              </ul>
                          </div>
                          <div className="spacer"/>
                          <div>
                              {button}
                          </div>

                          <div className="small-spacer"/>

                      </form>
                  </div>
            </div>
            <div className="row justify-content-center" >
              <div className="col-8" >
                 <Result resultList={this.state.resultList} chartData={this.state.chartData} uri={false} />
              </div>
            </div>
          </div>

      }


}

export default Fileform;
