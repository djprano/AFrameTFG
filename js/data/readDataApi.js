import * as configuration from "../configuration/configurationModel.js";


class AdsbDao {

    constructor() {
        this.fn = 'response';
        this.pathReference = '../../flightData' + configuration.flightLocalFolder + '//';
        this.length = 333;
        this.isLoaded = false;
        this.index = 70;
        this.endpoint = 'https://opensky-network.org/api/states/all?lamin=' + configuration.latMin + '&lomin=' + configuration.longMin + '&lamax=' + configuration.latMax + '&lomax=' + configuration.longMax;
    }

    getJsonData() {
        console.log("Api pop = " + this.index);
        let promise = this.readJsonData(this.index);
        this.index++;
        return promise;
    }

    getCredentials() {
        let user = configuration.apiUser
        let password = configuration.apiPassword;
        const credentials = user + ':' +  password;
        return btoa(credentials);
    }

    //Función recursiva para cargar todos los ficheros de manera sincrona y secuencial
    async readJsonData(index) {
        let promise;
        if (configuration.isLocalApiMode) {
            let dataUrl = new URL(this.pathReference + this.fn + index + '.json', import.meta.url);
            promise = fetch(dataUrl)
                .then(response => response.status == 404 ? undefined : response.json());
        } else {
            promise = fetch(this.endpoint, {
                method: 'GET',
                headers: { 'Authorization': 'Basic ' + this.getCredentials() }
            }).then(response => response.status == 404 ? undefined : response.json())
        }
        return promise;
    }



}

export { AdsbDao as AdsbDao }