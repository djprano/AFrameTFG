class LocalApi {

    constructor() {
        this.fn = 'response';
        this.pathReference = './/openSkyData//';
        this.length = 333;
        this.openSkyApi = [];
        this.isLoaded = false;
        this.readJsonData(0);
    }

    getJsonOpenSky() {
        console.log(this.index);
        this.index++;
        return this.openSkyApi.pop();
    }

    //Función recursiva para cargar todos los ficheros de manera sincrona y secuencial
    readJsonData(index){
        fetch(this.pathReference + this.fn + index + '.json')
        .then((response) => response.json())
        .then(json => {
            this.openSkyApi.push(json);
            if (this.openSkyApi.length == 333) {
                this.isLoaded = true;
                this.openSkyApi.reverse();
            }else{
                this.readJsonData(++index);
            }
        });
    }

    

}

export { LocalApi }











