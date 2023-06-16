//*********************Constantes de posiciones del array de datos OpenSkyApi

//Identificador de vuelo
export const ID = 0;

//Nombre del vuelo
export const NAME = 1;

//Pais de origen
export const  ORIGIN_COUNTRY = 2;

//Pais de origen
export const  VELOCITY = 9;

//Coordenada longitud
export const LONG = 5;

//Coordenada latitud
export const LAT = 6;

//Altitud del vuelo
export const ALTITUDE = 13;

//Orientación del vuelo con respecto al norte
export const TRUE_TRACK = 10;

//********************Constantes para el escalado del mapa */

//Constante de escalado en metros, se usa para no tener distancias en metros si no que en un factor representado por estas constante.
export const FACTOR = 100;

//Constante de creacimiento del simbolo
const SIMBOL_MAGNIFICATION = 4;

const SIMBOL_MAGNIFICATION_TEXT = 500;

export const scale = SIMBOL_MAGNIFICATION / FACTOR;

export const scaleText = SIMBOL_MAGNIFICATION_TEXT / FACTOR;

//********************Credenciales para la API */
export var apiUser;

export var apiPassword;

//MER(Minimun Enclosing Rectangle) en grados del escenario.

export var latMin;

export var latMax;

export var longMin;

export var longMax;

//Posición inicial de la cámara.
export var initCamPosition;

//Fichero de edificios
export var buildingFileName;

//Carpeta de datos de vuelos
export var flightLocalFolder;

//Establece el comportamiento local o tiempo real contra una API
export var isLocalApiMode = true;

//Etablece el intervalo de actualización de los datos en ms.
export var daoInterval = 1000;

//fichero con la capa raster del terreno.
export var mapRasterFile;

//fichero con la capa raster del terreno.
export var mapDemFile;

//Altura de la cámara al terreno en unidades 3D;
export var camHeight = 2;

export function setMerConfig(latmin,latmax,longmin,longmax){
    latMin = latmin;
    latMax = latmax;
    longMin = longmin;
    longMax = longmax;
}

export function setCamPosition(lat,long){
    initCamPosition = {lat:lat,long:long};
}

export function setBuildingFileName(filename){
    buildingFileName = filename;
}

export function setFlightLocalFolder(folder){
    flightLocalFolder = folder;
}

export function setMapRaster(rasterFile){
    mapRasterFile = rasterFile;
}

export function setMapDem(demFile){
    mapDemFile = demFile;
}

export function setCamHeight(height){
    camHeight = height;
}

export function setLocalApiMode(mode){
    isLocalApiMode = mode;
}

export function setDaoInterval(interval){
    daoInterval = interval;
}

export function setApiUsuer(user){
    apiUser = user;
}

export function setApiPassword(password){
    apiPassword = password;
}