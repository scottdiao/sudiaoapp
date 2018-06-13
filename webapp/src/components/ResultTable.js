import React, {Component} from 'react';
import {Modal} from './Modal';
import {capitalize} from '../api/Api'

class ResultTable extends Component {
    constructor(props){
        console.log("table constructor")
        super(props);
        this.state = {
            chartData:props.chartData,
            resultList:props.resultList,
            modalData:{},
            test:false
        }
        this.handleClick = this.handleClick.bind(this);
        this.setState = this.setState.bind(this);

    }

    componentWillReceiveProps(nextProps) {
        console.log("table receive prop")
        this.setState({
            chartData: nextProps.chartData,
            resultList: nextProps.resultList
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
    }


    render() {
        const mapsrc = "https://www.google.com/maps/embed/v1/place?key=AIzaSyBVTk5sRRV8IdnimweHLh1E_zxM3WK1u3g&q=place_id:"+this.state.modalData.place_id ;
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
            </tr>
        )


        return (
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
                <Modal id="tableModal" name={capitalize(this.state.modalData.name)} alias={this.state.modalData.alias} mapsrc={mapsrc} />
            </div>
        )
    }

}

export default ResultTable;
