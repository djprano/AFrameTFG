//*********************Constantes de posiciones del array de datos OpenSkyApi

//Identificador de vuelo
export const ID = 0;

//Nombre del vuelo
export const NAME = 1;

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

export let LAT_MIN = 40.178873;

export let LAT_MAX = 40.971604;

export let LONG_MIN = -4.702148;

export let LONG_MAX = -2.900391;

//Posición inicial de la cámara.
export const INIT_CAM_POSITION = {lat:40.4827317,long:-3.5818863};
