import React, { Component } from 'react';



export const testfunc=()=>{
    console.log("test function")
}

export const query_building_uri = async (data)=>{
    try {
        console.log("query cnn")
        let response = await fetch('http://localhost:5000/building_uri',{
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uri: data.get('imageuri'),
            })
        });
        let responseJson = await response.json();
        console.log("responseJson"+responseJson)
        return responseJson;
    } catch (error) {
        console.error(error);
    }
}

export const query_building_file = async (data)=>{
    try {
        console.log("query cnn file")
        let response = await fetch('http://localhost:5000/building_file',{
            method: 'POST',
            body: data
        });
        let responseJson = await response.json()

        return responseJson;
    } catch (error) {
        console.error(error);
    }
}