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

//MER(Minimun Enclosing Rectangle) en grados del escenario

export const LAT_MIN = 40.178873;

export const LAT_MAX = 40.971604;

export const LONG_MIN = -4.702148;

export const LONG_MAX = -2.900391;
