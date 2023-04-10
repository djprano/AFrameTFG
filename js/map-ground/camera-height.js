import heightManager from "./heightManager.js";
import * as OpenSkyModel from "../configuration/openSkyModel.js";
import mapConversion from "../gis/mapConversion.js";

AFRAME.registerComponent('terrain-height', {
    init: function () {
        this.personHeight = 2;
        this.loaded = false;
        let initCamPosition = mapConversion.degreeToWorld(OpenSkyModel.INIT_CAM_POSITION.lat, OpenSkyModel.INIT_CAM_POSITION.long);
        heightManager.addTerrainLoadedListener(() => {
            // Establece una altura inicial para la cámara
            this.el.object3D.position.y = heightManager.getTerrainHeight(initCamPosition.x, initCamPosition.y)+this.personHeight;
            this.loaded = true;
        });
    },

    tick: function () {
        if(this.loaded){
        // Obtener la posición actual de la cámarawww
        const position = this.el.object3D.position;

        // Obtener la altura del terreno en la posición actual de la cámara
        const terrainHeight = heightManager.getTerrainHeight(position.x, position.z);

        // Actualizar la altura de la cámara para que se ajuste a la altura del terreno
        this.el.object3D.position.y = terrainHeight+this.personHeight;
        }
    }
});