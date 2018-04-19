import React, {Component} from 'react';
import {Bar, Pie, HorizontalBar} from 'react-chartjs-2';

export function BarChart(props){
    console.log("call barchart")
    const chartData = props.chartData;
    const labels = chartData.labels;

    return (
        <div className="chart">
        <HorizontalBar
            type="horizontalBar"
            data={props.chartData}
            options={{
            title:{
                display:"Bar",
                text:'Building Probability ',
                fontSize:25
            }
        }}/>
</div>
    )
}

export function PieChart(props){
    return (
        <div className="chart">
            <Pie
            data={props.chartData}
            options={{
                title:{
                    display:"Pie",
                    text:'Building Probability',
                    fontSize:25
                }
            }}
            />
        </div>
    )
}
