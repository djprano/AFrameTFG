import * as fs from 'fs';
import * as configuration from "./configuration/configurationModel.js";

var user = 'xxxxxx';
var password = 'xxxxx';
var fn = 'response';
var saveFolder;
var index = 0;
var pathReference;



export function main(){
    pathReference = 'C:\\Users\\djpra\\Documentos\\workspaceTFG\\AFrameTest\\openSkyData'+saveFolder+'\\';
    var endpoint = 'https://opensky-network.org/api/states/all?lamin='+configuration.latMin+'&lomin='+configuration.longMin+'&lamax='+configuration.latMax+'&lomax='+configuration.longMax;
    setInterval(() => {
        fetch(endpoint, {
            method: 'GET',
            headers: { 'Authorization': 'Basic ' + btoa(user + ':' + password) }
        }).then(response => response.json()).then(json => {
            if(json != undefined && json != null && !isEmptyObject(json)){
                saveJson(json, index++);
            }        
        });
    }, 5500);
}

export function saveJson(jsonData,iteration){

    if (!fs.existsSync(pathReference)) {
        fs.mkdirSync(pathReference);
    }
    console.log("saving the iteration "+iteration);
    fs.writeFile(pathReference+fn+iteration+'.json', JSON.stringify(jsonData),'utf8', function(err) {
        if (err) {
            console.log(err);
        }
    });
}


function isEmptyObject(obj) {
    for (let name in obj) {
        return obj.states == null;
    }
    return true;
}

export function setUser(u){
    user = u;
}

export function setPassword(p){
    password = p;
}

export function setSaveFolder(folder) {
    saveFolder = folder;
}
