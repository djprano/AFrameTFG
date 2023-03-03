import * as OpenSkyModel from "../configuration/openSkyModel.js";


class LocalApi {

    constructor() {
        this.fn = 'response';
        this.pathReference = '../../openSkyData'+OpenSkyModel.FLIGHT_LOCAL_FOLDER+'//';
        this.length = 333;
        this.isLoaded = false;
        this.index = 0;
    }

    getJsonOpenSky() {
        console.log("Api pop = "+ this.index);
        let promise = this.readJsonData(this.index);
        this.index++;
        return promise;
    }

    //Función recursiva para cargar todos los ficheros de manera sincrona y secuencial
    async readJsonData(index){
        let dataUrl = new URL(this.pathReference + this.fn + index + '.json', import.meta.url);
        return fetch(dataUrl)
        .then((response) => response.status == 404 ? undefined : response.json());
    }

    

}

export { LocalApi }











