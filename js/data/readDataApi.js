import * as configuration from "../configuration/configurationModel.js";


class AdsbDao {

    constructor() {
        this.fn = 'response';
        this.pathReference = '../../flightData' + configuration.flightLocalFolder + '//';
        this.isLoaded = false;
        this.index = configuration.daoLocalIndex;
        this.endpoint = 'https://opensky-network.org/api/states/all?lamin=' + configuration.latMin + '&lomin=' + configuration.longMin + '&lamax=' + configuration.latMax + '&lomax=' + configuration.longMax;
        this.setCredentials();
    }

    getJsonData() {
        console.log("Api pop = " + this.index);
        let promise = this.readJsonData(this.index);
        this.index++;
        return promise;
    }

    setCredentials() {
        let user = configuration.apiUser
        let password = configuration.apiPassword;
        const credentials = user + ':' +  password;
        this.credentials =  btoa(credentials);
    }

    getCredentials(){
        return this.credentials;
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