import React, {Component} from 'react'
import {PieChart, BarChart, ResultTable} from './Chart'

class Result extends Component {
    constructor(props){
        super(props);
        this.state = {
            chartData:props.chartData,
            resultList:props.resultList,
            showBar:false,
            tapId:{
                table: "pills-table",
                bar: "pills-bar",
                pie: "pills-pie"
            }
        }
        this.handleClick = this.handleClick.bind(this);
    }


    componentWillReceiveProps(nextProps) {
        console.log("receive prop")
        this.setState({
            chartData: nextProps.chartData,
            resultList: nextProps.resultList,
            tapId:{
                table: nextProps.uri?"pills-table-uri":"pills-table",
                bar: nextProps.uri?"pills-bar-uri":"pills-bar",
                pie: nextProps.uri?"pills-pie-uri":"pills-pie",
            }
        });
    }

    handleClick(){
        console.log("clicked bar")
        console.log(this.state.chartData.labels[0])
    //     const chartData = this.state.chartData;
    //     this.setState({
    //         chartData:{
    //             labels: ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford'],
    //             datasets:[
    //                 {
    //                     label:'Population',
    //                     data:[
    //                         617594,
    //                         181045,
    //                         153060,
    //                         106519,
    //                         105162,
    //                         95072
    //                     ],
    //                     backgroundColor:[
    //                         'rgba(255, 99, 132, 0.6)',
    //                         'rgba(54, 162, 235, 0.6)',
    //                         'rgba(255, 206, 86, 0.6)',
    //                         'rgba(75, 192, 192, 0.6)',
    //                         'rgba(153, 102, 255, 0.6)',
    //                         'rgba(255, 159, 64, 0.6)',
    //                         'rgba(255, 99, 132, 0.6)'
    //                     ]
    //                 }
    //             ]
    //         }
    //     });
    //     console.log("chartdata"+this.state.chartData.labels[0])
    //     // this.state = {
    //     //     chartData:chartData
    //     //     // showBar: true
    //     // }
    //
    //   console.log("show bar"+this.state.showBar)
    }



    render() {
        if(Object.keys(this.state.chartData).length === 0 || Object.keys(this.state.chartData.datasets).length === 0) {
            return null
        } else{
            const mapsrc = "https://www.google.com/maps/embed/v1/place?key=AIzaSyBVTk5sRRV8IdnimweHLh1E_zxM3WK1u3g&q=place_id:"+this.state.resultList[this.state.chartData.labels[0]].place_id ;
            return (
                <div>
                    <div align="center">
                        <label><h3>Best Result:</h3></label>
                        <button type="button" className="btn btn-outline-info" data-toggle="modal" data-target="#exampleModal">
                            {this.state.chartData.labels[0]}
                        </button>
                    </div>
                    <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog"
                         aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">Building Detail</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">

                                    <label>Name:</label>{this.state.chartData.labels[0]}
                                    <label></label>{this.state.resultList[this.state.chartData.labels[0]].alias}
                                    <div className="row ">
                                        <div className="col" align="center">
                                            <iframe width="300" height="300" frameBorder="0" style={{border:1}}
                                                src={mapsrc} allowFullScreen>
                                            </iframe>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                    <ul className="nav nav-pills nav-fill mb-3" id="pills-tab" role="tablist">
                        <li className="nav-item">
                            <a className="nav-link active" id="pills-table-tab" data-toggle="pill" href={"#"+this.state.tapId.table} role="tab"
                               aria-controls="pills-table" aria-selected="true">Table</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="pills-bar-tab" data-toggle="pill" href={"#"+this.state.tapId.bar} role="tab"
                               aria-controls="pills-bar" aria-selected="false" onClick={this.handleClick}>Bar Chart</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="pills-pie-tab" data-toggle="pill" href={"#"+this.state.tapId.pie} role="tab"
                               aria-controls="pills-pie" aria-selected="false">Pie Chart</a>
                        </li>
                    </ul>

                    <div className="tab-content" id="pills-tabContent">

                        <div className="tab-pane fade show active" id = {this.state.tapId.table} role = "tabpanel" aria-labelledby = "pills-table-tab" >
                            <ResultTable chartData={this.state.chartData} />
                        </div>
                        <div className="tab-pane fade" id={this.state.tapId.bar} role="tabpanel"  aria-labelledby="pills-bar-tab">
                            <BarChart chartData={this.state.chartData} />
                        </div>
                        <div className="tab-pane fade" id={this.state.tapId.pie} role="tabpanel" aria-labelledby="pills-pie-tab">
                            <PieChart chartData={this.state.chartData} />
                        </div>
                    </div>
                </div>
            );
        }

    }
}

export default Result;