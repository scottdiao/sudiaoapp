import React, {Component} from 'react'
import {PieChart, BarChart} from './Chart'
import {Modal} from './Modal'
import ResultTable from './ResultTable'
import {capitalize} from '../api/Api'

class Result extends Component {
    constructor(props){
        super(props);
        this.state = {
            chartData:props.chartData,
            resultList:props.resultList,
            showResult:true,
            modalData:{},
            tapId:{
                table: "pills-table",
                bar: "pills-bar",
                pie: "pills-pie"
            }
        }
        this.handleClose = this.handleClose.bind(this);
        this.handleClick = this.handleClick.bind(this);

    }

    handleClose() {
        this.setState({
            showResult:false
        });
    }

    handleClick(e){
        e.preventDefault();
        var id = Number(e.target.id.slice(-1));
        const name = this.state.chartData.labels[id];
        const detail = this.state.resultList[name];
        this.setState({
            modalData:{
                name:name,
                alias:detail.alias,
                place_id:detail.place_id
            },
        })
        console.log("modal data"+JSON.stringify(this.state.modalData))
        console.log("set state success"+JSON.stringify(this.state.test))

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

    render() {

        if(Object.keys(this.state.chartData).length === 0 || Object.keys(this.state.chartData.datasets).length === 0 || !this.state.showResult) {
            return null
        } else{
            const labels = this.state.chartData.labels;
            const probability = this.state.chartData.datasets[0].data;
            const rows = [];

            for (var i = 0; i < labels.length; i++) {
                const tabledata = {
                    id: "row-" + i,
                    label: labels[i],
                    probability: probability[i]
                }
                rows.push(tabledata);
            }
            const tableRow = rows.map((row) =>
            <tr>
                <td data-toggle="modal" data-target="#tableModal" ><a id={row.id} href='#' onClick={this.handleClick}>{capitalize(row.label)}</a></td>
                <td>{row.probability}</td>
            </tr> )
            const mapsrc = "https://www.google.com/maps/embed/v1/place?key=AIzaSyBVTk5sRRV8IdnimweHLh1E_zxM3WK1u3g&q=place_id:"+this.state.modalData.place_id;
            const bestResult = this.state.chartData.labels[0];
            return (
            <div>
                <Modal id="tableModal" name={capitalize(this.state.modalData.name)} alias={this.state.modalData.alias} mapsrc={mapsrc} />
                <div className="radiusLarge shadow animated zoomIn">
                    <div className="result-close sright">
                         <button type="button" onClick={this.handleClose} className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="col-lg-8 col-sm-10 align-self-center" >
                        <div align="center">
                            <h4>Best Result</h4>
                            <button type="button" className="btn btn-outline-info building-name" id="result-0" onClick={this.handleClick} data-toggle="modal" data-target="#tableModal">
                                {capitalize(bestResult)}
                            </button>
                        </div>
                        <div className="spacerTiny" />

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
                                <div>
                                    <table className="table table-striped">
                                        <thead>
                                        <tr>
                                            <th scope="col">Name</th>
                                            <th scope="col">Probability</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {tableRow}
                                        </tbody>
                                    </table>

                                </div>

                            </div>
                            <div className="tab-pane fade" id={this.state.tapId.bar} role="tabpanel"  aria-labelledby="pills-bar-tab">
                                <BarChart chartData={this.state.chartData} />
                            </div>
                            <div className="tab-pane fade" id={this.state.tapId.pie} role="tabpanel" aria-labelledby="pills-pie-tab">
                                <PieChart chartData={this.state.chartData} />
                            </div>
                        </div>
                        <div className="spacer" />
                    </div>
                </div>

            </div>

            );
        }

    }
}

export default Result;
