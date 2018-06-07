import React from 'react';
import {convertWikiLink} from '../api/Api';



export function Modal(props) {
    const wikiLink = "https://en.wikipedia.org/wiki/"+convertWikiLink(props.name);
    return (
        <div>
            <div className="modal fade" id={props.id} tabIndex="-1" role="dialog"
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
                            {props.name}<br/>
                            {props.alias}
         
                            <div className="col align-self-center" align="center">
                                <iframe width="300" height="300" frameBorder="0" style={{border: 1}}
                                        src={props.mapsrc} allowFullScreen>
                                </iframe>
                            </div>


                            <div className="col align-self-center" align="center">
                                <a href={wikiLink} target="_blank">Wiki Link</a>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


