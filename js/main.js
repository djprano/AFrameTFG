//LocalApi
import { LocalApi } from "./data/readApiLocalOpenSky.js";
import * as OpenSkyModel from "./configuration/openSkyModel.js";
import mapConversion from "./gis/mapConversion.js";
import * as CacheData from "./data/FlightCacheData.js";
import * as mapGround from "./map-ground/map-ground.js";

/*****Variables ****/
var terrain;
var mainScene;
var sky;
var cam;
var lastFlight;
var hudEl;


var contador = 0;

/*****Constantes****/
const intervalTime = 1000;

var localApi = new LocalApi();

//Cache de vuelos, será mantenida por cada evento.
var flightsCache = new Map();
//Inicio de la escena.
AFRAME.registerComponent('main-scene', {
    init: function () {
        mainScene = this.el;
        terrain = mainScene.querySelector('#terrain');
        sky = mainScene.querySelector('#sky');
        cam = mainScene.querySelector('#camera');
        hudEl = mainScene.querySelector('#hud');
        //Cam position
        let initCamPosition = mapConversion.degreeToWorld(OpenSkyModel.INIT_CAM_POSITION.lat, OpenSkyModel.INIT_CAM_POSITION.long);
        initCamPosition.y = 40;

        // MapConversion.createCorner(OpenSkyModel.LONG_MAX,OpenSkyModel.LAT_MAX,'maxmax',mainScene);
        // MapConversion.createCorner(OpenSkyModel.LONG_MIN,OpenSkyModel.LAT_MAX,'maxmin',mainScene);
        // MapConversion.createCorner(OpenSkyModel.LONG_MAX,OpenSkyModel.LAT_MIN,'minmax',mainScene);
        // MapConversion.createCorner(OpenSkyModel.LONG_MIN,OpenSkyModel.LAT_MIN,'minmin',mainScene);


        mapGround.createMapGround();
        // Set up throttling.
        this.throttledFunction = AFRAME.utils.throttle(this.invertalEvent, intervalTime, this);
        //KEYBOARD EVENTS
        document.addEventListener('keydown', evt => {
            if (evt.key == 1 && lastFlight != undefined) {
                cam.setAttribute('position', lastFlight);
            }
        });
        cam.setAttribute('position', initCamPosition);

    },

    invertalEvent: function () {
        // Called every second.
        localApi.getJsonOpenSky().then(openSkyData => updateData(openSkyData))
    },

    tick: function (t, dt) {
        this.throttledFunction();
    },
}
);



//Extrae una coordenada 3D con sus conversiones afines de los datos de un vuelo.
function flightVectorExtractor(flight) {

    let latlong = mapConversion.degreeToMeter(flight[OpenSkyModel.LAT], flight[OpenSkyModel.LONG]);
    let mercatorVector = { x: latlong.x, y: flight[OpenSkyModel.ALTITUDE], z: latlong.y };
    return mapConversion.mercatorToWorld(mercatorVector);
}

//Crea el texto encima del avión.
function createElementText(flight) {
    //creamos el texto del nombre del vuelo
    let entityText = document.createElement('a-text');
    entityText.setAttribute('value', flight[OpenSkyModel.NAME]);
    entityText.setAttribute('scale', { x: OpenSkyModel.scaleText, y: OpenSkyModel.scaleText, z: OpenSkyModel.scaleText });
    entityText.setAttribute('position', { x: 0, y: 30, z: 0 });
    entityText.setAttribute('height', 10);
    entityText.setAttribute('width', 10);
    entityText.setAttribute('side', 'double');
    entityText.setAttribute('align', 'center');
    entityText.setAttribute('anchor', 'center');
    return entityText;
}

//Funcion que actualiza los elementos de la escena.
function updateData(data) {
    if (data == null || data == undefined) return;
    //creamos un set con los id que vamos a generar en esta actualización para mantenimiento de aviones, 
    //todos los no actualizados se borran
    let updateFlights = new Set();

    //Filtramos vuelos con nombre indefinido de vuelo ya que será nuestro primary key.
    data.states.filter(flight => flight != null &&
        flight[OpenSkyModel.ID] != null &&
        flight[OpenSkyModel.ID] != undefined &&
        flight[OpenSkyModel.ID] != "").
        forEach(flight => {
            //Extraemos la información del vuelo necesaria.
            let id = flight[OpenSkyModel.ID];

            //Guardamos el vuelo que estamos actualizando en el set
            updateFlights.add(id);

            //Orientación al norte
            let rotationY = -flight[OpenSkyModel.TRUE_TRACK] + 180;
            rotationY = { x: 0, y: rotationY, z: 0 };

            let entityEl;
            let cacheData;

            //Creamos el objeto de nueva posición 
            let newPosition = flightVectorExtractor(flight);

            //Comprobamos si está en la cache
            if (flightsCache.has(id)) {
                entityEl = document.getElementById(id);

                cacheData = flightsCache.get(id);
                cacheData.backupData();//mueve los datos de las variables new a las variables last
            } else {
                //Generamos el elemento gltf-model de vuelo y el objeto wrapper que contiene la información del vuelo
                // y las posiciones en el mundo 3d para la animación.
                entityEl = createFlightElement(id);
                cacheData = new CacheData.FlightCacheData(id, flight);
            }

            cacheData.newPosition = newPosition;
            cacheData.newRotation = rotationY;

            //Creamos la animación si tiene almacenado una posición anterior
            if (cacheData.lastPosition != null && cacheData.lastPosition != undefined) {

                if (cacheData.lastPosition != cacheData.newPosition) {
                    entityEl.setAttribute('animation__000', {
                        property: 'position',
                        from: cacheData.lastPosition,
                        to: cacheData.newPosition,
                        autoplay: true,
                        loop: 0,
                        easing: 'linear',
                        dur: intervalTime
                    });
                }


                //orientación del modelo con respecto al norte
            } else {
                entityEl.setAttribute('position', newPosition);
            }
            //Atributos que se actualizan siempre
            entityEl.setAttribute('rotation', rotationY);

            //Guardarmos el vuelo en la cache
            flightsCache.set(id, cacheData);

            //salvamos la posición del último vuelo para mover la cámara
            lastFlight = newPosition;
        });

    //Borrado de vuelos no actualizados para no dejar un avión congelado.
    Array.from(flightsCache.keys()).filter(key => !updateFlights.has(key)).forEach(key => removeFlightElement(key));
}

//crea los elementos html de los aviones.
function createFlightElement(id) {
    //Vuelo nuevo
    let entityEl = document.createElement('a-entity');
    entityEl.setAttribute('id', id);
    entityEl.setAttribute('gltf-model', "#plane");
    entityEl.setAttribute('class', "clickable");
    entityEl.setAttribute('scale', { x: OpenSkyModel.scale, y: OpenSkyModel.scale, z: OpenSkyModel.scale });
    entityEl.setAttribute('hover-scale', 'maxScale: 10; maxDistance: 10000');


    entityEl.addEventListener('mouseenter', evt => handleMouseEvent(evt));
    entityEl.addEventListener('mouseleave', evt => handleMouseEvent(evt));
    mainScene.appendChild(entityEl);
    return entityEl;

}

const HUD_SHOW_JSON = 'hud-show-json';
const HUD_OBJECT_SELECTED = 'hud-object-selected';
const ID_ATRIBUTE = 'id';
//Consumidor de eventos mouse enter
function handleMouseEvent(evt) {

    if (evt.type === 'mouseenter') {
        const flightEl = evt.currentTarget;
        // Crear un json con los datos del vuelo.
        let flightData = flightsCache.get(flightEl.getAttribute(ID_ATRIBUTE)).data;
        let jsonData = {};
        jsonData["ID"] = flightData[OpenSkyModel.ID];
        jsonData["Altitude"] = flightData[OpenSkyModel.ALTITUDE];
        jsonData["Name"] = flightData[OpenSkyModel.NAME];

        mainScene.emit(HUD_SHOW_JSON, jsonData);
        mainScene.emit(HUD_OBJECT_SELECTED, flightEl);
        console.log("hudon");
    } else if (evt.type === 'mouseleave') {
        //mainScene.emit('hud-hide');
        console.log("hudoff");
    }

}

//borra un avión del DOM.
function removeFlightElement(id) {
    let entityEl = document.getElementById(id);
    entityEl.parentNode.removeChild(entityEl);
    flightsCache.delete(id);
}

function getBoundingString() {
    return OpenSkyModel.LAT_MIN + "," + OpenSkyModel.LONG_MIN + "," + OpenSkyModel.LAT_MAX + "," + OpenSkyModel.LONG_MAX;
}

//Función para debugear el terreno calcula la coordenada 3D y pone una caja en cada vertice.
function createVertexDebug(heightData, gridSize, groundSize, zMagnification) {
    let cellSize = { width: groundSize.width / gridSize.width, height: groundSize.height / gridSize.height }
    heightData.forEach((element, index, array) => {
        let height = zMagnification * (element / 65535);
        let vertex = document.createElement("a-box");
        let x = ((index % (gridSize.width + 1)) * cellSize.width) - (groundSize.width / 2);
        let y = (Math.trunc(index / (gridSize.width + 1)) * cellSize.height) - (groundSize.height / 2)
        vertex.setAttribute("id", 'vertex-' + index);
        vertex.setAttribute("depth", 0.1);
        vertex.setAttribute("height", 0.1);
        vertex.setAttribute("width", 0.1);
        vertex.setAttribute("position", { x: x, y: height, z: y });
        mainScene.appendChild(vertex);
        console.log();
    });
}
