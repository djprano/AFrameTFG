import heightManager from "./heightManager.js";
import * as configuration from "../configuration/configurationModel.js";
import mapConversion from "../gis/mapConversion.js";

/*****Constantes****/
const intervalTime = 200;

AFRAME.registerComponent('terrain-height', {
    init: function () {
        this.mainScene = document.querySelector('a-scene');
        this.personHeight = configuration.camHeight;
        this.loaded = false;
        let initCamPosition = mapConversion.degreeToWorld(configuration.initCamPosition.lat, configuration.initCamPosition.long);
        heightManager.addTerrainLoadedListener(() => {
            // Establece una altura inicial para la cámara
            this.el.object3D.position.y = heightManager.getTerrainHeight(initCamPosition.x, initCamPosition.z) + this.personHeight;
            this.loaded = true;
        });
        this.throttledFunction = AFRAME.utils.throttle(this.invertalEvent, intervalTime, this);
    },

    invertalEvent: function () {
        if (this.loaded) {
            // Obtener la posición actual de la cámara
            let camPos = this.el.object3D.position;
            // Posición del padre de la cámara
            let rigPos = this.el.parentEl.object3D.position;
            const position = (new THREE.Vector3(0, 0, 0)).copy(camPos).add(rigPos);

            // Obtener la altura del terreno en la posición actual de la cámara
            const terrainHeight = heightManager.getTerrainHeight(position.x, position.z,false);

            // Actualizar la altura de la cámara para que se ajuste a la altura del terreno
            this.el.object3D.position.y = terrainHeight + this.personHeight;
        }
    },

    tick: function () {
        this.throttledFunction();
    }
});