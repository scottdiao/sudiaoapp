import React, {Component} from 'react';
import {Bar, Line, Pie} from 'react-chartjs-2';

export function ResultTable(props){
    if(Object.keys(props.chartData).length === 0 || Object.keys(props.chartData.datasets).length === 0){
        return null
    }else {
        const labels = props.chartData.labels;
        const probability = props.chartData.datasets[0].data;
        const rows = [];

        for (var i = 0; i < labels.length; i++) {
            const tabledata = {
                label: labels[i],
                probability: probability[i]
            }
            rows.push(tabledata);
        }
        const tableRow = rows.map((row) =>
            <tr>
                <td>{row.label}</td>
                <td>{row.probability}</td>
            </tr>
        )


        return (
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
        )
    }
}

export function BarChart(props){
    console.log("call barchart")
    const chartData = props.chartData;
    const labels = chartData.labels;
    // labels.map(function(label){
    //     var newLabels = "";
    //     console.log(label)
    //     console.log(label.length)
    //     const labelArr = label.split(" ")
    //     labelArr.map(function(arr)){
    //         newLabels += " \ " + arr
    //     });
    //     console.log(newLabels)
    // });
    return (
        <div className="chart">
        <Bar
    data={props.chartData}
    options={{
        title:{
            display:"Bar",
                text:'Building Probability ',
                fontSize:25
        },
        type:"horizontalBar"
    }}
    />
</div>
    )
}

export function PieChart(props){
    return (
        <div className="chart">
            <Pie
            data={props.chartData}
            // options={{
            //     title:{
            //         display:this.props.displayTitle,
            //         text:'Largest Cities In '+this.props.location,
            //         fontSize:25
            //     },
            //     legend:{
            //         display:this.props.displayLegend,
            //         position:this.props.legendPosition
            //     }
            // }}
            />
        </div>
    )
}

class Chart extends Component{
    constructor(props){
        console.log("chart constructor")
        super(props);
        this.state = {
            chartData:props.chartData
        }
        console.log(props.chartData)
    }

    static defaultProps = {
        displayTitle:true,
        displayLegend: true,
        legendPosition:'right',
        location:'City'
    }

    componentWillReceiveProps(nextProps) {
        this.setState({chartData: nextProps.chartData});
    }

    render(){
        if(Object.keys(this.state.chartData).length === 0){
            return null
        }else{
            return (
                <div className="chart">
                    <Bar
                        type='horizontalBar'
                        data={this.state.chartData}
                        options={{
                            title:{
                                display:this.props.displayTitle,
                                text:'Building Probability ',
                                fontSize:25
                            },
                            legend:{
                                display:this.props.displayLegend,
                                position:this.props.legendPosition
                            }
                        }}
                    />

                    <Line
                        data={this.state.chartData}
                        options={{
                        title:{
                        display:this.props.displayTitle,
                        text:'Largest Cities In '+this.props.location,
                        fontSize:25
                        },
                        legend:{
                        display:this.props.displayLegend,
                        position:this.props.legendPosition
                        }
                    }}
                    />

                    <Pie
                        data={this.state.chartData}
                        options={{
                        title:{
                        display:this.props.displayTitle,
                        text:'Largest Cities In '+this.props.location,
                        fontSize:25
                        },
                        legend:{
                        display:this.props.displayLegend,
                        position:this.props.legendPosition
                        }
                    }}
                    />
                </div>
            )
        }

    }
}

export default Chart;