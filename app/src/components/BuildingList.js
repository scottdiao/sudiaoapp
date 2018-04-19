import React, {Component} from 'react';
import {capitalize, query_building_list} from '../api/Api'

class BuildingList extends Component {
    constructor(){
        super();
        console.log("building list constructor")
        this.state = {
            isLoading:false,
            buildingList:[]
        }
    }

    async componentWillMount() {
        console.log("will mount")
        this.setState({isLoading:true})
        let res = await query_building_list();
        this.setState({isLoading:false})
        if(typeof(res) === 'undefined' || res === null){
            this.setState({error: {
                    hasError:true,
                    errorMes:"Can not loading the list"
                }});
            return
        }
        var list = [];

        res.map((building)=>{
            list.push(building.name)
        })
        console.log(JSON.stringify(list))
        this.setState({buildingList:list})
    }


    render() {
        const list = this.state.buildingList
        const number = list.length;

        const loading = this.state.isLoading ? (
            <div>
                <h4>Loading...</h4>
                <div className="lds-ring">
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                </div>
            </div>
        ) : (
            <div align="center"><h5>Total {number} Buildings</h5></div>
        );


        const tableRow = list.map((row) =>
            <tr>
                <td >{capitalize(row)}</td>
            </tr>
        )


        return (
            <div>
                <div className="row">
                    <div className="col" align="center">
                        {loading}
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-6" align="center">

                        <table className="table table-striped">
                            <tbody>
                            {tableRow}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

}

export default BuildingList;