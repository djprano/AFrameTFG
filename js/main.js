//LocalApi
import { LocalApi } from "./readApiLocalOpenSky.js";
import * as OpenSkyModel from "./openSkyModel.js";



var terrain;
var mainScene;
var sky;
var cam;
var lastFlight;
const intervalTime = 5000;
const localApi = new LocalApi();
var displacement;

//Cache de vuelos, será mantenida por cada evento.
var flightsCache = new Map();




AFRAME.registerComponent('position-listener', {
    tick: function () {
        const newValue = this.el.getAttribute('position');
        const stringCoords = AFRAME.utils.coordinates.stringify(newValue);
        if (this.lastValue !== stringCoords) {
            this.el.emit('positionChanged', newValue);
            this.lastValue = stringCoords;
        }
    }
});

AFRAME.registerComponent('handle-events', {
    tick: function () {
        var el = this.el;  // <a-box>
        let scale = 1.5;
        let unscale = 1 / scale;

        //Eventos

        el.addEventListener('mouseenter', function () {
            el.setAttribute('scale', { x: scale, y: scale, z: scale });
        });
        el.addEventListener('mouseleave', function () {
            el.setAttribute('scale', { x: unscale, y: unscale, z: unscale });
        });
        el.addEventListener('click', function () {
            if (lastFlight != undefined) {
                cam.setAttribute('position', lastFlight);
            }
        });

        document.getElementById('camera').addEventListener('positionChanged', e => {
        });
    }
});


AFRAME.registerComponent('main-scene', {
    init: function () {
        mainScene = this.el;
        terrain = mainScene.querySelector('#terrain');
        sky = mainScene.querySelector('#sky');
        cam = mainScene.querySelector('#camera');
        // Set up throttling.
        this.throttledFunction = AFRAME.utils.throttle(this.invertalEvent, intervalTime, this);
        //Displacement calculation
        displacementCalculation();    

    },

    invertalEvent: function () {
        // Called every second.
        let openSkyData = localApi.getJsonOpenSky();
        if (openSkyData != undefined) {
            buildPlane(openSkyData);
        }

    },

    tick: function (t, dt) {
        this.throttledFunction();
    },
}
);

//Displacement calculation
function displacementCalculation(){
    
    let longDispDegrees = (OpenSkyModel.LONG_MAX - OpenSkyModel.LONG_MIN)/2;
    let latDispDegrees = (OpenSkyModel.LAT_MAX - OpenSkyModel.LAT_MIN)/2;
    
    displacement = degreeToMeter(latDispDegrees,longDispDegrees);
}

function degreeToMeter(lat,long){
    let latlng = new L.latLng(lat, long);
    return L.Projection.Mercator.project(latlng);
}

//Extrae una coordenada 3D con sus conversiones afines de los datos de un vuelo.
function flightVectorExtractor(flight) {

    let point = degreeToMeter(flight[OpenSkyModel.LAT],flight[OpenSkyModel.LONG]);
    let mercatorVector = {x:point.x,y:flight[OpenSkyModel.ALTITUDE],z:point.y};
    return mercatorToWorld(mercatorVector);
}

//Esta función comvierte una coordenada mercator a una coordenada en el mundo 3d
//En el 3d tenemos conversiones de factor , desplazamiento y cambio de ejes.
function mercatorToWorld(mercatorVector){
    let xWorld = (mercatorVector.x-displacement.x)/OpenSkyModel.FACTOR;
    let yWorld = (mercatorVector.z-displacement.y)/OpenSkyModel.FACTOR;
    let altitudeWorld = mercatorVector.y == null ? 0: mercatorVector.y/OpenSkyModel.FACTOR;

    return {x:xWorld,y:altitudeWorld,z:yWorld};
}

//Convierte los datos del mundo 3D a un vector en mercator en metros
function worldtoMercator(worldVector){
    let xMercator = (worldVector.x*OpenSkyModel.FACTOR)+displacement.x;
    let yMercator = (worldVector.z*OpenSkyModel.FACTOR)+displacement.y;
    let altitude = worldVector.y*OpenSkyModel.FACTOR;

    return {x:xMercator,y:altitude,z:yMercator};
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
            let rotationY = flight[OpenSkyModel.TRUE_TRACK] + 180;

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
                cacheData = new FlightCacheData(id,null,newPosition);
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
            entityEl.setAttribute('position', cacheData.newData);
            entityEl.setAttribute('rotation', { x: 0, y: rotationY, z: 0 });

            //Guardarmos el vuelo en la cache
            flightsCache.set(id, cacheData);

            //salvamos la posición del último vuelo para mover la cámara
            lastFlight = newPosition;
        });
}

function createFlightElement(id) {
    //Vuelo nuevo
    const scale = 4 / OpenSkyModel.FACTOR;
    let entityEl = document.createElement('a-entity');
    entityEl.setAttribute('id', id);
    entityEl.setAttribute('gltf-model', "#plane");
    entityEl.setAttribute('scale', { x: scale, y: scale, z: scale });
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

