//LocalApi
import { AdsbDao } from "./data/readDataApi.js";
import * as configuration from "./configuration/configurationModel.js";
import mapConversion from "./gis/mapConversion.js";
import * as CacheData from "./data/FlightCacheData.js";
import heightManager from "./map-ground/heightManager.js";

/*****Variables ****/
var terrain;
var mainScene;
var sky;
var cam;
var rig;
var hudEl;


/*****Constantes****/
const intervalTime = configuration.daoInterval;

var adsbDao = new AdsbDao();

//Cache de vuelos, será mantenida por cada evento.
var flightsCache = new Map();
//Inicio de la escena.
AFRAME.registerComponent('main-scene', {
    init: function () {
        mainScene = this.el;
        terrain = mainScene.querySelector('#terrain');
        sky = mainScene.querySelector('#sky');
        cam = mainScene.querySelector('#camera');
        rig = mainScene.querySelector('#rig');
        hudEl = mainScene.querySelector('#hud');
        //Cam position
        let initCamPosition = mapConversion.degreeToWorld(configuration.initCamPosition.lat, configuration.initCamPosition.long);
        initCamPosition.y = 40;

        heightManager.createMapGround();
        // Establecemos la función de intervalo cuando se carga el terreno y la inicializamos a vacio para no provocar condiciones de carrera.
        this.throttledFunction = ()=>{
            //Nothing
        };
        // Cuando se cargue el terreno establecemos la correcta.
        heightManager.addTerrainLoadedListener(() => {
            this.throttledFunction = AFRAME.utils.throttle(this.invertalEvent, intervalTime, this);
        });
        
        rig.setAttribute('position', initCamPosition);
    },

    invertalEvent: function () {
        // Called every second.
        adsbDao.getJsonData().then(jsonData => updateData(jsonData))
    },

    tick: function (t, dt) {
        this.throttledFunction();
    },
}
);

//Extrae una coordenada 3D con sus conversiones afines de los datos de un vuelo.
function flightVectorExtractor(flight) {
    //obtenemos coordenadas geodesicas y las proyectamos.
    let latlong = mapConversion.degreeToMeter(flight[configuration.LAT], flight[configuration.LONG]);
    let mercatorVector = { x: latlong.x, y: 0, z: latlong.y };
    //convertimos a un vector en el mundo 3D
    let resultVector = mapConversion.mercatorToWorld(mercatorVector);
    //obetenemos la altura sobre el terreno
    let terrainHeight = heightManager.getTerrainHeight(resultVector.x, resultVector.z);
    //Calculamos la altura en el mundo 3D y si está por debajo del umbral de aterrizar le sumamos la altura del terreno si no el promedio de alturas.
    const flightHeight = flight[configuration.ALTITUDE] / configuration.HIGHT_FACTOR;
    let toLandCondition = (flight[configuration.ALTITUDE] < configuration.heightThresholdToLand) || (flight[configuration.ALTITUDE] == undefined) || (flight[configuration.ALTITUDE] == null);
    resultVector.y = toLandCondition ?  terrainHeight + flightHeight : heightManager.getAverageHeight() + flightHeight;
    return resultVector;
}

//Crea el texto encima del avión.
function createElementText(flight) {
    //creamos el texto del nombre del vuelo
    let entityText = document.createElement('a-text');
    entityText.setAttribute('value', flight[configuration.NAME]);
    entityText.setAttribute('scale', { x: configuration.scaleText, y: configuration.scaleText, z: configuration.scaleText });
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
    //Controlamos que no se consuman datos erroneos.
    if (data == null || data == undefined || data.states == null || data.states == undefined){
        console.log("dato de la API erroneo: " + JSON.stringify(data));
        return;
    }
    //creamos un set con los id que vamos a generar en esta actualización para mantenimiento de aviones, 
    //todos los no actualizados se borran
    let updateFlights = new Set();

    //Filtramos vuelos con nombre indefinido de vuelo ya que será nuestro primary key.
    data.states.filter(flight => flight != null &&
        flight[configuration.ID] != null &&
        flight[configuration.ID] != undefined &&
        flight[configuration.ID] != "").
        forEach(flight => {
            //Extraemos la información del vuelo necesaria.
            let id = flight[configuration.ID];

            //Guardamos el vuelo que estamos actualizando en el set
            updateFlights.add(id);

            //Orientación al norte
            let rotationY = -flight[configuration.TRUE_TRACK] + 180;
            rotationY = { x: 0, y: rotationY, z: 0 };

            let entityEl;
            let cacheData;

            //Creamos el objeto de nueva posición 
            let newPosition = flightVectorExtractor(flight);

            //Comprobamos si está en la cache
            if (flightsCache.has(id)) {
                entityEl = document.getElementById(id);

                cacheData = flightsCache.get(id);
                cacheData.data = flight;
                cacheData.backupData();//mueve los datos de las variables new a las variables last
            } else {
                //Generamos el elemento gltf-model de vuelo y el objeto wrapper que contiene la información del vuelo
                // y las posiciones en el mundo 3d para la animación.
                entityEl = createFlightElement(id);
                cacheData = new CacheData.FlightCacheData(id, flight, mainScene);
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
    entityEl.setAttribute('scale', { x: configuration.scale, y: configuration.scale, z: configuration.scale });
    entityEl.setAttribute('hover-scale', 'limitDistance: 100');
    entityEl.addEventListener('mouseenter', evt => handleMouseEnter(evt));
    entityEl.addEventListener('click', evt => handleMouseClick(evt));
    entityEl.addEventListener('mouseleave', evt => handleMouseLeave(evt));
    mainScene.appendChild(entityEl);
    return entityEl;

}

const HUD_SHOW_JSON = 'hud-show-json';
const HUD_OBJECT_SELECTED = 'hud-object-selected';
const HUD_OBJECT_ENTER = 'hud-object-enter';
const HUD_OBJECT_LEAVE = 'hud-object-leave';
const ID_ATRIBUTE = 'id';

//Consumidor de eventos mouse enter
function handleMouseClick(evt) {
    const flightEl = evt.currentTarget;
    // Crear un json con los datos del vuelo.
    let flightCacheData = flightsCache.get(flightEl.getAttribute(ID_ATRIBUTE));
    flightEl.object3D.userData.points = flightCacheData.points;
    mainScene.emit(HUD_SHOW_JSON, flightCacheData.getJsonData());
    mainScene.emit(HUD_OBJECT_SELECTED, flightEl);
}

//Consumidor de eventos mouse enter
function handleMouseEnter(evt) {
    const flightEl = evt.currentTarget;
    mainScene.emit(HUD_OBJECT_ENTER, flightEl);
}

//Consumidor de eventos mouse leave
function handleMouseLeave(evt) {
    const flightEl = evt.currentTarget;
    mainScene.emit(HUD_OBJECT_LEAVE, flightEl);
}

//borra un avión del DOM.
function removeFlightElement(id) {
    let entityEl = document.getElementById(id);
    entityEl.parentNode.removeChild(entityEl);
    //limpiamos objetos asociados
    flightsCache.get(id).clear();
    flightsCache.delete(id);
}

function getBoundingString() {
    return configuration.latMin + "," + configuration.longMin + "," + configuration.latMax + "," + configuration.longMax;
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
