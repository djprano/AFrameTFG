//Clase wrapper que contiene la información de la posición anterior y la nueva posicón y será almacenado en la cache.

export class FlightCacheData {

    //Constructor
    constructor(id, data) {
        this._id = id;
        this._data = data;
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
    //Guardarmos los datos de new en last
    backupData(){
        this.lastPosition = this.newPosition;
        this.lastRotation = this.newRotation;
    }
}