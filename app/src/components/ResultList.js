import React from 'react'

const ResultList = function(props) {
    console.log("call result list")
    const results = props.result;
    const listResult = results.map((result) =>
        <li key={result.toString()}>{result}</li>
    );
    return (
        <ul>{listResult}</ul>
    );
}

export default ResultList