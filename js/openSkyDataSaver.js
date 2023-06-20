import * as fs from 'fs';
import * as configuration from "./configuration/configurationModel.js";

var fn = 'response';
var index = 0;

export function main() {
    var endpoint = 'https://opensky-network.org/api/states/all?lamin=' + configuration.latMin + '&lomin=' + configuration.longMin + '&lamax=' + configuration.latMax + '&lomax=' + configuration.longMax;
    var credentials = Buffer.from(configuration.apiUser + ':' + configuration.apiPassword).toString('base64');
    setInterval(() => {
        fetch(endpoint, {
            method: 'GET',
            headers: { 'Authorization': 'Basic ' + credentials }
        }).then(response => response.json()).then(json => {
            if (json != undefined && json != null && !isEmptyObject(json)) {
                saveJson(json, index++);
            }
        });
    }, configuration.daoInterval);
}

export function saveJson(jsonData, iteration) {

    if (!fs.existsSync(configuration.flightLocalFolder)) {
        fs.mkdirSync(configuration.flightLocalFolder);
    }
    let filename = configuration.flightLocalFolder + fn + iteration + '.json';
    console.log("saving filename:" + filename);
    fs.writeFile(filename, JSON.stringify(jsonData), 'utf8', function (err) {
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
