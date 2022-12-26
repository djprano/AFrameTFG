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

function getBoundingString() {
    return OpenSkyModel.LAT_MIN + "," + OpenSkyModel.LONG_MIN + "," + OpenSkyModel.LAT_MAX + "," + OpenSkyModel.LONG_MAX;
}

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

        // MapConversion.createCorner(OpenSkyModel.LONG_MAX,OpenSkyModel.LAT_MAX,'maxmax',mainScene);
        // MapConversion.createCorner(OpenSkyModel.LONG_MIN,OpenSkyModel.LAT_MAX,'maxmin',mainScene);
        // MapConversion.createCorner(OpenSkyModel.LONG_MAX,OpenSkyModel.LAT_MIN,'minmax',mainScene);
        // MapConversion.createCorner(OpenSkyModel.LONG_MIN,OpenSkyModel.LAT_MIN,'minmin',mainScene);

        var color = "#d9c0d9";

        fetch('.//data//' + 'terminal.geojson')
            .then((response) => response.json())
            .then(itemJSON => {
                let maxBuildings = 10000;
                for (let feature of itemJSON.features) {
                    if(maxBuildings == 0){
                        break;
                    }else{
                        maxBuildings--;
                    }
                    if (feature.geometry.type == "Polygon") {
                        let wayPoints = [];
                        // //debug/////////////////////////////
                        // let corner = feature.geometry.coordinates[0][0];
                        // MapConversion.createCorner(corner[0],corner[1],'bulding position',mainScene);
                        // //debug/////////////////////////////
                        for (let way of feature.geometry.coordinates) {
                            for (let point of way) {
                                let pointMeter = MapConversion.degreeToMeter(point[1], point[0]);//point[1] lat ; point[0] long
                                let mercatorVector = { x: pointMeter.x, y: 0, z: pointMeter.y };
                                let point3d = MapConversion.mercatorToWorld(mercatorVector);
                                wayPoints.push({ x: point3d.x, y: point3d.z });
                            }
                        }
                        let item = document.createElement("a-entity");
                        let buildingProperties = { primitive: "building", points: wayPoints };
                        let featureHeight = feature.properties["height"];
                        let levels = feature.properties["building:levels"];
                        let metersByLevel = 3;
                        let height;
                        //prioridad a la propiedad altura si no usamos 
                        if(featureHeight != undefined && featureHeight != null){
                            height = featureHeight;
                        }else{
                            height = levels != undefined ? levels * metersByLevel : 15;
                        }
                        buildingProperties.height = height /OpenSkyModel.FACTOR;
                        item.setAttribute("id", feature.id);
                        item.setAttribute("geometry", buildingProperties);
                        item.setAttribute( "material", {color: 'red', roughness: 0.5, metalness: 0.5});
                        mainScene.appendChild(item);
                    }
                }
            });

    },

    invertalEvent: function () {
        // Called every second.
        if (localApi.isLoaded) {
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

    let latlong = MapConversion.degreeToMeter(flight[OpenSkyModel.LAT], flight[OpenSkyModel.LONG]);
    let mercatorVector = { x: latlong.x, y: flight[OpenSkyModel.ALTITUDE], z: latlong.y };
    return MapConversion.mercatorToWorld(mercatorVector);
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

//Funcion para depurar la  posición del vector de vuelo, acabará siendo borrada
function createElementTextPosition(vector) {
    //creamos el texto del nombre del vuelo
    let entityText = document.createElement('a-text');
    entityText.setAttribute('value', contador++);
    let magnificationText = 100;
    entityText.setAttribute('scale', { x: magnificationText * OpenSkyModel.scale, y: magnificationText * OpenSkyModel.scale, z: magnificationText * OpenSkyModel.scale });
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
            //Orientación al norte
            let rotationY = -flight[OpenSkyModel.TRUE_TRACK]-180;

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
                cacheData = new FlightCacheData(id, null, newPosition);

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
            //orientación del modelo con respecto al norte
            entityEl.setAttribute('rotation', { x: 0, y: rotationY, z: 0 });

            //Guardarmos el vuelo en la cache
            flightsCache.set(id, cacheData);

            //salvamos la posición del último vuelo para mover la cámara
            lastFlight = newPosition;
            // //Para debugear el trazado que debe realizar
            // if (flight[OpenSkyModel.NAME].includes('AFR69LY')) {
            //     createElementTextPosition(newPosition);
            // }
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
class FlightCacheData {

    //Constructor
    constructor(id, lastData, newData) {
        this.id = id;
        this.lastData = lastData;
        this.newData = newData;
    }
}

AFRAME.registerGeometry('building', {
    schema: {
        height: { type: 'number', default: 10 },
        points: { default: ['-10 10', '-10 -10', '10 -10'], }
    },
    init: function (data) {
        let shape = new THREE.Shape(data.points);

        let extrudedGeometry = new THREE.ExtrudeGeometry(shape, {
            depth: data.height,
            bevelEnabled: false
        });
        extrudedGeometry.rotateX(Math.PI / 2);
        extrudedGeometry.translate(0, data.height, 0);
        this.geometry = extrudedGeometry;
    }
});
