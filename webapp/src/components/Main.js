import React, { Component } from 'react';
import Fileform from './Fileform';
import Uriform from './Uriform';

class Main extends Component{
    render(){
        return(
        <div>
            <div className="row justify-content-center" >
                <div className="col-8" align="center">
                    <ul className="nav nav-tabs nav-fill" id="myTab" role="tablist">
                        <li className="nav-item">
                            <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab"
                               aria-controls="home" aria-selected="true">Image Upload</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab"
                               aria-controls="profile" aria-selected="false">Image uri</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="row justify-content-center" >
                <div className="col-11" align="center">
                    <div className="spacer"/>
                    <div className="tab-content" id="myTabContent">
                        <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab"><Fileform /></div>
                        <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab"><Uriform /></div>
                    </div>
                </div>
            </div>
        </div>
        )
    }
}

export default Main;
