import React, { Component } from 'react';
export const web_service_endpoint = 'https://atomic-amulet-199016.appspot.com/'
export const test_web_service_endpoint = 'http://localhost:5000/'


export const testfunc=()=>{
    console.log("test function")
}



export const query_building_uri = async (data)=>{
    try {
        let response = await fetch(web_service_endpoint+'building_uri',{
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
        return responseJson;
    } catch (error) {
        console.error(error);
    }
}

export const query_building_file = async (data)=>{
    try {
        let response = await fetch(web_service_endpoint+'building_file',{
            method: 'POST',
            body: data
        });
        let responseJson = await response.json()
        return responseJson;
    } catch (error) {
        console.error(error);
    }
}

export const query_building_list = async ()=>{
    try {
        let response = await fetch(web_service_endpoint+"building_list");
        let responseJson = await response.json()

        return responseJson;
    } catch (error) {
        console.error(error);
    }
}

export function capitalize(str) {
    var doNotUpper = {'of' : 1, 'the':1, 'and':1};
    var uppderAll = {'cctv' : 1,'citic':1, 'ctf':1, 'ii':1, 'kk100':1};
    if(str===''||str===undefined){
        return;
    }
    return str.replace(/\w\S*/g, function(txt){return doNotUpper[txt] ? txt: uppderAll[txt]?txt.toUpperCase():txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

export function convertWikiLink(str) {
    if(str===''||str===undefined){
        return;
    }
    return str.replace(/\s/g, '_');
}
