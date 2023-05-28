//Clase wrapper que contiene la información de la posición anterior y la nueva posicón y será almacenado en la cache.

export class FlightCacheData {

    //Constructor
    constructor(id, data,mainScene) {
        this._id = id;
        this._data = data;
        this._points = [];
        this.mainScene = mainScene;
    }

    get lastPosition() {
        return this._lastPosition;
    }

    set lastPosition(position) {
        this._lastPosition = position;
    }

    get newPosition() {
        return this._newPosition;
    }

    set newPosition(position) {
        this._newPosition = position;
    }

    get lastRotation() {
        return this._lastRotation;
    }

    set lastRotation(rotation) {
        this._lastRotation = rotation;
    }

    get newRotation() {
        return this._newRotation;
    }

    set newRotation(rotation) {
        this._newRotation = rotation;
    }

    get data(){
        return this._data;
    }

    get points(){
        return this._points;
    }
    clear(){
        this.mainScene.emit('flightCacheData_clear_'+this._id,null);
    }
    //Guardarmos los datos de new en last
    backupData(){
        if(this.lastPosition != undefined && this.lastPosition != null){
            this._points.push(this.lastPosition);
            this.mainScene.emit('flightCacheData_push_'+this._id,this.lastPosition);
        }
        this.lastPosition = this.newPosition;
        this.lastRotation = this.newRotation;
    }
}