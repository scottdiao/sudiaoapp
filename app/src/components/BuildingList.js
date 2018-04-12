import React, {Component} from 'react';
import {capitalize, query_building_list} from '../api/Api'
import { Link } from 'react-router-dom'

class BuildingList extends Component {
    constructor(){
        console.log("list constructor")
        super();
        this.state = {
            error: {
                hasError:false,
                errorMes:""
            },
            buildingList:[]
        }


    }

async componentWillMount() {
    console.log("will mount")
        let res = await query_building_list();
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
        const tableRow = list.map((row) =>
            <tr>
                <td >{capitalize(row)}</td>
            </tr>
        )


        return (
            <div>
                <div className="row">
                    <div className="col" align="center">
                        <Link to="/">Back</Link>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-6" align="center">
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th scope="col">Building List</th>
                            </tr>
                            </thead>
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