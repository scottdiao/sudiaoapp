import React, {Component} from 'react';
import {Bar, Line, Pie} from 'react-chartjs-2';

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