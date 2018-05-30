import React, {Component} from 'react';
import {capitalize, query_building_list} from '../api/Api'
import "./css/react-table.css";
import ReactTable from "./ReactTable";

class BuildingList extends Component {
    constructor(){
        super();
        this.state = {
            isLoading:false,
            buildingList:[],
            filtered: []
        }
    }

    async componentWillMount() {
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
            list.push({"name": capitalize(building.name)})
        })

        console.log(JSON.stringify(list))
        this.setState({buildingList:list})
    }


    render() {
        const list = this.state.buildingList
        const number = list.length;

        const loading = this.state.isLoading ? (
            <div align="center">
                <h4>Loading...</h4>
                <div className="lds-ring">
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                </div>
            </div>
        ) : (
            <div></div>
        );



        if(this.state.isLoading){
          return (
            loading
          )
        }else{
          return (
            <div className="row justify-content-center">
              <div className="col-8 align-self-center" align="center">
                <ReactTable
                  data={list}
                  columns={[
                    {
                      Header: "Building List",
                      accessor: 'name',
                      filterMethod: (filter, row) => {
                        var regexConstructor = new RegExp(filter.value, 'i');
                        return regexConstructor.test(row[filter.id]);
                      },
                      Footer: (
                        <span>
                          <strong>Total:   {number}</strong>
                        </span>
                      )
                    }
                  ]}
                  filterable
                  filtered={this.state.filtered}
                  onFilteredChange={filtered => this.setState({ filtered })}
                  defaultSorted={[
                    {
                      id: "name"
                    }
                  ]}
                  defaultPageSize={10}
                  className="-striped -highlight"
                />
                 <div className="spacerSmall" />
              </div>
            </div>

          )
        }
    }

}

export default BuildingList;
