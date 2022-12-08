class LocalApi {

    constructor() {
        this.fn = 'response';
        this.pathReference = './/openSkyData//';
        this.length = 333;
        this.openSkyApi = [];
        this.index = 0;
        this.isLoaded = false;
        for (let index = 0; index < this.length; index++) {

            fetch(this.pathReference + this.fn + index + '.json')
                .then((response) => response.json())
                .then(json => {
                    this.openSkyApi.push(json);
                    if(this.openSkyApi.length == 333){
                        this.isLoaded = true;
                        this.openSkyApi.reverse();
                    }
                });
        }
    }

    getJsonOpenSky() {
        console.log(this.index);
        this.index++;
        return this.openSkyApi.pop();
    }

}

export{LocalApi}











