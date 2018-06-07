import React from 'react';

export function ErrorMessage(props){
    const error = props.error;
    if(error.hasError){
        return  <div className="alert alert-danger" role="alert">
                    {error.errorMes}
                </div>
    }else{
        return null
    }
}

export default ErrorMessage