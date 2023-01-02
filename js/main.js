//LocalApi
import { LocalApi } from "./readApiLocalOpenSky.js";
import * as OpenSkyModel from "./openSkyModel.js";
import * as MapConversion from "./mapConversion.js";

/*****Variables ****/
var terrain;
var mainScene;
var sky;
var cam;
var lastFlight;

var contador = 0;

/*****Constantes****/
const intervalTime = 1000;

var localApi = new LocalApi();

//Cache de vuelos, será mantenida por cada evento.
var flightsCache = new Map();
// condiciones de carrera no veo el problema pero por el momento es necesario.
function sleep(milliseconds) {
    let start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
sleep(500);
//Inicio de la escena.
AFRAME.registerComponent('main-scene', {
    init: function () {

        //Displacement calculation
        MapConversion.displacementCalculation();

        mainScene = this.el;
        terrain = mainScene.querySelector('#terrain');
        sky = mainScene.querySelector('#sky');
        cam = mainScene.querySelector('#camera');
        //Cam position
        let initCamPosition = MapConversion.degreeToWorld(OpenSkyModel.INIT_CAM_POSITION.lat, OpenSkyModel.INIT_CAM_POSITION.long);
        initCamPosition.y = 2;

        // MapConversion.createCorner(OpenSkyModel.LONG_MAX,OpenSkyModel.LAT_MAX,'maxmax',mainScene);
        // MapConversion.createCorner(OpenSkyModel.LONG_MIN,OpenSkyModel.LAT_MAX,'maxmin',mainScene);
        // MapConversion.createCorner(OpenSkyModel.LONG_MAX,OpenSkyModel.LAT_MIN,'minmax',mainScene);
        // MapConversion.createCorner(OpenSkyModel.LONG_MIN,OpenSkyModel.LAT_MIN,'minmin',mainScene);


        createMapGround();
        createTerminal();

                // Set up throttling.
                this.throttledFunction = AFRAME.utils.throttle(this.invertalEvent, intervalTime, this);
                        //KEYBOARD EVENTS
        document.addEventListener('keydown', evt => {
            if (evt.key == 1 && lastFlight != undefined) {
                cam.setAttribute('position', lastFlight);
            }
        });
        cam.setAttribute('position',initCamPosition);

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

//Funcion que actualiza los elementos de la escena.
function updateData(data) {
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
                cacheData.lastData = cacheData.newData;
                cacheData.newData = { position: newPosition, rotation: rotationY };

            } else {
                entityEl = createFlightElement(id);
                cacheData = new FlightCacheData(id, null, { position: newPosition, rotation: rotationY });

                //creamos el texto del nombre del vuelo
                let entityText = createElementText(flight);
                entityEl.appendChild(entityText);
            }

            //Creamos la animación si tiene almacenado una posición anterior
            if (cacheData.lastData != null && cacheData.lastData != undefined) {

                if (cacheData.lastData.position != cacheData.newData.position) {
                    entityEl.setAttribute('animation__000', {
                        property: 'position',
                        from: cacheData.lastData.position,
                        to: cacheData.newData.position,
                        autoplay: true,
                        loop: 0,
                        easing: 'linear',
                        dur: intervalTime
                    });
                }

                // if (cacheData.lastData.rotation != cacheData.newData.rotation) {
                //     entityEl.setAttribute('animation__001', {
                //         property: 'rotation',
                //         from: cacheData.lastData.rotation,
                //         to: cacheData.newData.rotation,
                //         autoplay: true,
                //         loop: 0,
                //         easing: 'easeInSine',
                //         dir: 'reverse',
                //         dur: intervalTime
                //     });
                // }
                //orientación del modelo con respecto al norte
            } else {
                entityEl.setAttribute('position', newPosition);
            }
            entityEl.setAttribute('rotation', rotationY);



            //Guardarmos el vuelo en la cache
            flightsCache.set(id, cacheData);

            //salvamos la posición del último vuelo para mover la cámara
            lastFlight = newPosition;
            // //Para debugear el trazado que debe realizar
            // if (flight[OpenSkyModel.NAME].includes('AFR69LY')) {
            //     createElementTextPosition(newPosition);
            // }
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
    entityEl.setAttribute('scale', { x: OpenSkyModel.scale, y: OpenSkyModel.scale, z: OpenSkyModel.scale });
    mainScene.appendChild(entityEl);
    return entityEl;

}

//borra un avión del DOM.
function removeFlightElement(id){
    let entityEl = document.getElementById(id);
    entityEl.parentNode.removeChild(entityEl);
    flightsCache.delete(id);
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

//Carga los datos de la terminal del aeropuerto y genera las geometrías custom de los edificios.
function createTerminal() {
    fetch('.//data//' + OpenSkyModel.BUILDING_FILE_NAME + '.geojson')
        .then((response) => response.json())
        .then(itemJSON => {
            let maxBuildings = 10000;
            for (let feature of itemJSON.features) {
                if (maxBuildings == 0) {
                    break;
                } else {
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
                    if (featureHeight != undefined && featureHeight != null) {
                        height = featureHeight;
                    } else {
                        height = levels != undefined ? levels * metersByLevel : 70;
                    }
                    buildingProperties.height = height / OpenSkyModel.FACTOR;
                    item.setAttribute("id", feature.id);
                    item.setAttribute("geometry", buildingProperties);
                    item.setAttribute("material", { color: '#8aebff', roughness: 0.8, metalness: 0.8 });
                    mainScene.appendChild(item);
                }
            }
        });
}


//Geometría custom para extruir edificios a partir de una superficie y su altura.
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

//Crea un plano con la imagen correspondiente al mapa, tan solo es una referencia.
function createMapGround() {
    let groundSize = MapConversion.getGroundSize();
    if (true) {
        let terrainEl = document.createElement('a-entity');
        terrainEl.setAttribute('id', "terrain");
        let atributes = {
            map: 'url(data/vatry_map.png)',
            dem: 'url(data/smallMap.bin)',
            planeWidth: groundSize.width,
            planeHeight: groundSize.height,
            segmentsWidth: 199,
            segmentsHeight: 199,
            zPosition: 100
        };
        terrainEl.setAttribute('terrain-model', atributes);
        mainScene.appendChild(terrainEl);
    } else {
        //Map image
        let mapTileGround = document.createElement("a-plane");
        mapTileGround.setAttribute("id", 'mapTileGround');
        mapTileGround.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        mapTileGround.setAttribute("position", { x: 0, y: 0, z: 0 });
        mapTileGround.setAttribute("src", '#groundTexture');
        mapTileGround.setAttribute("width", groundSize.width);
        mapTileGround.setAttribute("height", groundSize.height);
        mainScene.appendChild(mapTileGround);
    }
    //ajuste de la esfera de cielo
    let skyEl = document.getElementById("sky");
    skyEl.setAttribute("radius",Math.min(groundSize.width,groundSize.height)/2);
}

function getBoundingString() {
    return OpenSkyModel.LAT_MIN + "," + OpenSkyModel.LONG_MIN + "," + OpenSkyModel.LAT_MAX + "," + OpenSkyModel.LONG_MAX;
}
