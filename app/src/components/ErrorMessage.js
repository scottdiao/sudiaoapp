import React from 'react';

export function ErrorMessage(props){
    const error = props.error;
    if(error.hasError){
        return <div className="row justify-content-center" >
            <div className="col-8" >
                <div className="alert alert-danger" role="alert">
                    {error.errorMes}
                </div>
            </div>
        </div>
    }else{
        return null
    }
}

export default ErrorMessage