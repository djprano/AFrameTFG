//LocalApi
import { LocalApi } from "./readApiLocalOpenSky.js";
import * as OpenSkyModel from "./openSkyModel.js";
import * as MapConversion from "./mapConversion.js";

/*****Constantes****/
const intervalTime = 3000;
const localApi = new LocalApi();



/*****Variables ****/
var terrain;
var mainScene;
var sky;
var cam;
var lastFlight;

var contador = 0;

//Cache de vuelos, será mantenida por cada evento.
var flightsCache = new Map();

AFRAME.registerComponent('main-scene', {
    init: function () {
        mainScene = this.el;
        terrain = mainScene.querySelector('#terrain');
        sky = mainScene.querySelector('#sky');
        cam = mainScene.querySelector('#camera');
        // Set up throttling.
        this.throttledFunction = AFRAME.utils.throttle(this.invertalEvent, intervalTime, this);
        //Displacement calculation
        MapConversion.displacementCalculation();

        //KEYBOARD EVENTS
        document.addEventListener('keydown', evt => {
            if (evt.key == 1 && lastFlight != undefined) {
                cam.setAttribute('position', lastFlight);
            }
        });

        // createCorner(OpenSkyModel.LONG_MAX,OpenSkyModel.LAT_MAX,'maxmax');
        // createCorner(OpenSkyModel.LONG_MIN,OpenSkyModel.LAT_MAX,'maxmin');
        // createCorner(OpenSkyModel.LONG_MAX,OpenSkyModel.LAT_MIN,'minmax');
        // createCorner(OpenSkyModel.LONG_MIN,OpenSkyModel.LAT_MIN,'minmin');

        

    },

    invertalEvent: function () {
        // Called every second.
        if(localApi.isLoaded){
            let openSkyData = localApi.getJsonOpenSky();
            if (openSkyData != undefined) {
                buildPlane(openSkyData);
            }
        }
    },

    tick: function (t, dt) {
        this.throttledFunction();
    },
}
);



//Extrae una coordenada 3D con sus conversiones afines de los datos de un vuelo.
function flightVectorExtractor(flight) {

    let point = MapConversion.degreeToMeter(flight[OpenSkyModel.LAT],flight[OpenSkyModel.LONG]);
    let mercatorVector = {x:point.x,y:flight[OpenSkyModel.ALTITUDE],z:point.y};
    return MapConversion.mercatorToWorld(mercatorVector);
}

//Crea el texto encima del avión.
function createElementText(flight){
    //creamos el texto del nombre del vuelo
    let entityText = document.createElement('a-text');
    entityText.setAttribute('value',flight[OpenSkyModel.NAME]);
    entityText.setAttribute('scale', { x: OpenSkyModel.scaleText, y: OpenSkyModel.scaleText, z: OpenSkyModel.scaleText});
    entityText.setAttribute('position', { x: 0, y: 30, z: 0 });
    entityText.setAttribute('height', 10);
    entityText.setAttribute('width', 10);
    entityText.setAttribute('side', 'double');
    entityText.setAttribute('align', 'center');
    entityText.setAttribute('anchor', 'center');
    return entityText;
}

//Funcion para depurar la  posición del vector de vuelo, acabará siendo borrada
function createElementTextPosition(vector){
    //creamos el texto del nombre del vuelo
    let entityText = document.createElement('a-text');
    entityText.setAttribute('value',contador++);
    let magnificationText = 100;
    entityText.setAttribute('scale', { x: magnificationText*OpenSkyModel.scale, y: magnificationText*OpenSkyModel.scale, z: magnificationText*OpenSkyModel.scale });
    entityText.setAttribute('position', vector);
    entityText.setAttribute('height', 10);
    entityText.setAttribute('width', 10);
    entityText.setAttribute('side', 'double');
    entityText.setAttribute('align', 'center');
    entityText.setAttribute('anchor', 'center');
    mainScene.appendChild(entityText);
}


function buildPlane(data) {
    //Filtramos vuelos con nombre indefinido de vuelo ya que será nuestro primary key.
    data.states.filter(flight => flight != null &&
        flight[OpenSkyModel.ID] != null &&
        flight[OpenSkyModel.ID] != undefined &&
        flight[OpenSkyModel.ID] != "").
        forEach(flight => {
            //Extraemos la información del vuelo necesaria.
            let id = flight[OpenSkyModel.ID];
            let rotationY = flight[OpenSkyModel.TRUE_TRACK];

            let entityEl;
            let cacheData;

            //Creamos el objeto de nueva posición 
            let newPosition = flightVectorExtractor(flight);

            //Comprobamos si está en la cache
            if (flightsCache.has(id)) {
                entityEl = document.getElementById(id);

                cacheData = flightsCache.get(id);
                cacheData.lastData = cacheData.newData;
                cacheData.newData = newPosition;

            } else {
                entityEl = createFlightElement(id);
                entityEl.setAttribute('position', newPosition);
                cacheData = new FlightCacheData(id,null,newPosition);

                //creamos el texto del nombre del vuelo
                let entityText = createElementText(flight);
                entityEl.appendChild(entityText);
            }

            //Creamos la animación si tiene almacenado una posición anterior
            if (cacheData.lastData != null && cacheData.lastData != undefined) {
                entityEl.setAttribute('animation', {
                    property: 'position',
                    from: cacheData.lastData,
                    to: cacheData.newData,
                    autoplay: true,
                    loop: 0,
                    easing: 'linear',
                    dur: intervalTime
                });
            }
            entityEl.setAttribute('rotation', { x: 0, y: rotationY, z: 0 });

            //Guardarmos el vuelo en la cache
            flightsCache.set(id, cacheData);

            //salvamos la posición del último vuelo para mover la cámara
            lastFlight = newPosition;
            //Para debugear el trazado que debe realizar
            if(flight[OpenSkyModel.NAME].includes('AFR69LY')){
                createElementTextPosition(newPosition);
            }
        });
}

function createFlightElement(id) {
    //Vuelo nuevo
    let entityEl = document.createElement('a-entity');
    entityEl.setAttribute('id', id);
    entityEl.setAttribute('gltf-model', "#plane");
    entityEl.setAttribute('scale', { x: OpenSkyModel.scale, y: OpenSkyModel.scale, z: OpenSkyModel.scale });
    mainScene.appendChild(entityEl);
    return entityEl;

}

//Clase wrapper que contiene la información de la posición anterior y la nueva posicón y será almacenado en la cache.
class FlightCacheData{
    
    //Constructor
    constructor(id,lastData , newData){
        this.id = id;
        this.lastData = lastData;
        this.newData = newData;
    }
}
