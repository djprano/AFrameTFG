const fs = require('fs');

import * as OpenSkyModel from "./openSkyModel.js";

var endpoint = 'https://opensky-network.org/api/states/all?lamin='+OpenSkyModel.LAT_MIN+'&lomin='+OpenSkyModel.LONG_MIN+'&lamax='+OpenSkyModel.LAT_MAX+'&lomax='+OpenSkyModel.LONG_MAX;
var user = 'xxxxxx';
var password = 'xxxxx';
var fn = 'response';
var pathReference = 'C:\\Users\\djpra\\Documentos\\workspaceTFG\\openSkyData\\';
var index = 0;

function saveJson(jsonData,iteration){
    
    fs.writeFile(pathReference+fn+iteration+'.json', JSON.stringify(jsonData),'utf8', function(err) {
        if (err) {
            console.log(err);
        }
    });
}

// sleep time expects milliseconds
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  setInterval(() => {
    fetch(endpoint, {
        method: 'GET',
        headers: { 'Authorization': 'Basic ' + btoa(user + ':' + password) }
    }).then(response => response.json()).then(json => saveJson(json,index++));
  }, 5500);


