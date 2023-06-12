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
const simbolMagnification = 4;

const simbolMagnificationText = 500;

export const scale = simbolMagnification / FACTOR;

export const scaleText = simbolMagnificationText / FACTOR;

//MER(Minimun Enclosing Rectangle) en grados del escenario.

export var LAT_MIN;

export var LAT_MAX;

export var LONG_MIN;

export var LONG_MAX;

//Posición inicial de la cámara.
export var INIT_CAM_POSITION;

//Fichero de edificios
export var BUILDING_FILE_NAME;

//Carpeta de datos de vuelos
export var FLIGHT_LOCAL_FOLDER;

//fichero con la capa raster del terreno.
export var MAP_RASTER_FILE;

//fichero con la capa raster del terreno.
export var MAP_DEM_FILE;

//Altura de la cámara al terreno en unidades 3D;
export var CAM_HEIGHT = 2;

export function setMerConfig(latmin,latmax,longmin,longmax){
    LAT_MIN = latmin;
    LAT_MAX = latmax;
    LONG_MIN = longmin;
    LONG_MAX = longmax;
}

export function setCamPosition(lat,long){
    INIT_CAM_POSITION = {lat:lat,long:long};
}

export function setBuildingFileName(filename){
    BUILDING_FILE_NAME = filename;
}

export function setFlightLocalFolder(folder){
    FLIGHT_LOCAL_FOLDER = folder;
}

export function setMapRaster(rasterFile){
    MAP_RASTER_FILE = rasterFile;
}

export function setMapDem(demFile){
    MAP_DEM_FILE = demFile;
}

export function setCamHeight(height){
    CAM_HEIGHT = height;
}
