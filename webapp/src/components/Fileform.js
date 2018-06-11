import React from 'react';
import './css/foundation.css';
import './css/app.css';
import '../../node_modules/react-dropzone-component/styles/filepicker.css'
import '../../node_modules/dropzone/dist/min/dropzone.min.css'
import {query_building_file, web_service_endpoint, test_web_service_endpoint} from '../api/Api'
import Result from './Result';
import ErrorMessage from './ErrorMessage'
import DropzoneComponent from './DropzoneComponent';


class Fileform extends React.Component {
  constructor() {
    super()
    this.state = {
      files: {},
      isLoading: false,
      error: {
        hasError:false,
        errorMes:""
      },
      chartData:{},
      resultList:{}
     }
      this.djsConfig = {
          addRemoveLinks: true,
          acceptedFiles: "image/jpeg,image/png",
          maxFilesize: 500,
          // autoProcessQueue: false,
          maxFiles: 1
      };

      this.componentConfig = {
          iconFiletypes: ['.jpg', '.png'],
          showFiletypeIcon: true,
          postUrl: '/uploadHandler'
      };
      this.callbackArray = [() => console.log('Hi!'), () => console.log('Ho!')];
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileRemoved=this.handleFileRemoved.bind(this);
  }

    handleFileAdded(file) {
        this.setState({
            files:file
        });
        console.log(this.state.files)
    }

    handleFileRemoved() {
        this.setState({
            files:{}
                });
    }





async handleSubmit(event) {
    const uuidv1 = require('uuid/v1');
    const uuid = uuidv1();

    this.setState({error: {
            hasError:false,
            errorMes:""
        }});
    event.preventDefault();
    const data = new FormData(event.target);
    const file = this.state.files
    if(Object.keys(this.state.files).length === 0){
        this.setState({error: {
                hasError:true,
                errorMes:"No image to upload"
            }});
        return
    }
    data.append('file', file)
    data.append('uuid', uuid)
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
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
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

      const result = this.state.isLoading ? (
          <div/>
      ) : (
          <Result resultList={this.state.resultList} chartData={this.state.chartData} uri={false} />
      );

      const config = this.componentConfig;
      const djsConfig = this.djsConfig;

      // For a list of all possible events (there are many), see README.md!
      const eventHandlers = {
          addedfile: this.handleFileAdded.bind(this),
          drop: this.callbackArray,
          removedfile:this.handleFileRemoved
      }



      return   <div >
                <div className="col-8 align-self-center" align="center">
                      <ErrorMessage error={this.state.error} />
                </div>
                  <div className="col-4 align-self-center" align="center">

                      <form onSubmit={this.handleSubmit.bind(this)} name="dropzone" encType="multipart/form-data">
                          <DropzoneComponent className="fileDropZone" config={config}
                                             eventHandlers={eventHandlers}
                                             djsConfig={djsConfig} />
                          <div className="spacer"/>
                          <div>
                              {button}
                          </div>

                          <div className="spacerSmall"/>

                      </form>
                  </div>
              <div className="col-12 align-self-center" >
                  {result}
              </div>
          </div>

      }


}

export default Fileform;
