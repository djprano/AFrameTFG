//LocalApi
import { LocalApi } from "./readApiLocalOpenSky.js";
import * as OpenSkyModel from "./openSkyModel.js";



var terrain;
var mainScene;
var sky;
var cam;
var lastFlight;
const intervalTime = 1000;
const localApi = new LocalApi();

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
                cam.setAttribute('position', { x: lastFlight[0], y: lastFlight[1], z: lastFlight[2] });
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

function flightVectorExtractor(flight) {

    let latlng = new L.latLng(flight[OpenSkyModel.LAT], flight[OpenSkyModel.LONG]);
    let point = L.Projection.Mercator.project(latlng);
    let xPos = point.x / OpenSkyModel.FACTOR;
    let yPos = point.y / OpenSkyModel.FACTOR;
    let zPos = flight[OpenSkyModel.ALTITUDE] / OpenSkyModel.FACTOR;
    let vector = [xPos, zPos, yPos];
    return vector;
}



function buildPlane(data) {
    //Filtramos vuelos con nombre indefinido de vuelo ya que será nuestro primary key.
    data.states.filter(flight => flight[OpenSkyModel.NAME] != null && flight[OpenSkyModel.NAME] != undefined && flight[OpenSkyModel.NAME] != "").
        forEach(flight => {
            //Extraemos la información del vuelo necesaria.
            let name = flight[OpenSkyModel.NAME];
            let vector = flightVectorExtractor(flight);
            let rotationY = flight[OpenSkyModel.TRUE_TRACK] + 180;

            let entityEl;

            if (flightsCache.has(name)) {
                //Si está el vuelo en la cache
                entityEl = document.getElementById(name);
            } else {
                //Vuelo nuevo
                const scale = 5 / OpenSkyModel.FACTOR;
                entityEl = document.createElement('a-entity');
                entityEl.setAttribute('id', name);
                entityEl.setAttribute('gltf-model', "#plane");
                entityEl.setAttribute('scale', { x: scale, y: scale, z: scale });
                mainScene.appendChild(entityEl);
            }
            //cambiamos la posición del vuelo
            console.log("Actualizando el vuelvo" + name);
            //Si ya se introdujo en el mapa se crea el componente animación desde el punto anterior hasta la nueva posición
            let newPosition = { x: vector[0], y: vector[1] == null ? 0 : vector[1], z: vector[2] };
            if (entityEl.getAttribute('position') != null) {
                let lastPosition = entityEl.getAttribute('position');
                entityEl.setAttribute('animation', {
                    property: 'position',
                    from: lastPosition,
                    to: newPosition,
                    autoplay: true,
                    easing: 'linear',
                    dur: intervalTime
                });
            }
            entityEl.setAttribute('position', newPosition);
            entityEl.setAttribute('rotation', { x: 0, y: rotationY, z: 0 });

            //Guardarmos el vuelo en la cache
            flightsCache.set(name, flight);
            console.log("Actualizado el vuelvo" + name);
            //salvamos la posición del último vuelo para mover la cámara
            lastFlight = vector;
        });
}
