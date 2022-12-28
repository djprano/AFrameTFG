class LocalApi {

    constructor() {
        this.fn = 'response';
        this.pathReference = './/openSkyData_madrid//';
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
        return fetch(this.pathReference + this.fn + index + '.json')
        .then((response) => response.json());
    }

    

}

export { LocalApi }











