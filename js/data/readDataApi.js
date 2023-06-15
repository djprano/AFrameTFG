import * as configuration from "../configuration/configurationModel.js";


class AdsbDao {

    constructor() {
        this.fn = 'response';
        this.pathReference = '../../flightData'+configuration.FLIGHT_LOCAL_FOLDER+'//';
        this.length = 333;
        this.isLoaded = false;
        this.index = 70;
    }

    getJsonData() {
        console.log("Api pop = "+ this.index);
        let promise = this.readJsonData(this.index);
        this.index++;
        return promise;
    }

    //Función recursiva para cargar todos los ficheros de manera sincrona y secuencial
    async readJsonData(index){
        let dataUrl;
        if(configuration.IS_LOCAL_API_MODE){
            dataUrl  = new URL(this.pathReference + this.fn + index + '.json', import.meta.url);
        }else{

        }
        return fetch(dataUrl)
        .then((response) => response.status == 404 ? undefined : response.json());
    }

    

}

export { AdsbDao as AdsbDao }











