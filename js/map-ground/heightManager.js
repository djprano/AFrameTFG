import mapConversion from "../gis/mapConversion.js";
import * as OpenSkyModel from "../configuration/openSkyModel.js";

class HeightManager {

    //**Constructor */
    constructor() {
        this.mainScene = document.querySelector('a-scene');
        this.zMagnification = 350;
        this.terrainListeners = [];
    }
    /**
     * Calcula la altura en función de su coordenadas 3d.
     * @param {*} x coordenada x de la posición de la que se quiere saber la altura.
     * @param {*} y coordenada y de la posición de la que se quiere saber la altura.
     * @returns el valor de la altura.
     */
    getTerrainHeight(x, y) {
        //Cálculo de indice de la matríz de alturas.
        let indexX = Math.round((x + (this.groundSize.width / 2)) / (this.cellSize.width));
        let indexY = Math.round((y + (this.groundSize.height / 2)) / (this.cellSize.height));
        let index = (indexY * (this.gridSize.width + 1)) + indexX;
        return this.zMagnification * (this.heightData[index] / 65535);//se divide entre 2^16 debido a que es un Uint16Array
    }

    /**
     * Crea un plano con la imagen correspondiente al mapa, tan solo es una referencia.
     */
    createMapGround() {
        this.groundSize = mapConversion.getGroundSize();
        let terrainEl = document.createElement('a-entity');
        terrainEl.setAttribute('id', "terrain");
        let atributes = {
            wireframe: true,
            map: 'url(data/vatry_map.png)',
            dem: 'url(data/smallMap.bin)',
            planeWidth: this.groundSize.width,
            planeHeight: this.groundSize.height,
            segmentsWidth: 199,
            segmentsHeight: 199,
            zPosition: 350
        };
        //calculos previos para convertir posición 3D a posicion array de alturas
        this.gridSize = { height: atributes.segmentsHeight, width: atributes.segmentsWidth };
        this.cellSize = { width: this.groundSize.width / this.gridSize.width, height: this.groundSize.height / this.gridSize.height }

        terrainEl.setAttribute('terrain-model', atributes);
        this.mainScene.appendChild(terrainEl);
        terrainEl.addEventListener("demLoaded", evt => {
            this.heightData = evt.target.components['terrain-model'].heightData;
            this.createBuildings(this.heightData, mapConversion.getGroundSize(), this.gridSize, atributes.zPosition);
            this.terrainListeners.forEach(listener => listener());
        });

        //ajuste de la esfera de cielo
        let skyEl = document.getElementById("sky");
        skyEl.setAttribute("radius", Math.min(this.groundSize.width, this.groundSize.height) / 2);
    }

    /**
     * Carga los datos de la terminal del aeropuerto y genera las geometrías custom de los edificios.
     * @param {*} heightData Datos de altura.
     * @param {*} groundSize tamaño del suelo.
     * @param {*} gridSize dimensión de la matriz de alturas.
     * @param {*} zMagnification magnificación de alturas.
     */
    createBuildings(heightData, groundSize, gridSize, zMagnification) {

        // createVertexDebug(heightData,gridSize,groundSize,zMagnification);
        let dataUrl = new URL('../../data/' + OpenSkyModel.BUILDING_FILE_NAME + '.geojson', import.meta.url);

        fetch(dataUrl)
            .then((response) => response.json())
            .then(((gridSize, groundSize, heightData, zMagnification, itemJSON) => {
                let maxBuildings = 10000;

                for (let feature of itemJSON.features) {
                    if (maxBuildings == 0) {
                        break;
                    } else {
                        maxBuildings--;
                    }
                    if (feature.geometry.type == "Polygon") {
                        let wayPoints = [];
                        let numPoints = 0;
                        let centroid = { x: 0, y: 0 };
                        for (let way of feature.geometry.coordinates) {
                            for (let point of way) {
                                let pointMeter = mapConversion.degreeToMeter(point[1], point[0]);//point[1] lat ; point[0] long
                                let mercatorVector = { x: pointMeter.x, y: 0, z: pointMeter.y };
                                let point3d = mapConversion.mercatorToWorld(mercatorVector);
                                wayPoints.push({ x: point3d.x, y: point3d.z });
                                centroid.x = centroid.x + point3d.x;
                                centroid.y = centroid.y + point3d.z;
                                numPoints++;
                            }
                        }
                        //Calculo del centroide del edificio
                        centroid.x = centroid.x / numPoints;
                        centroid.y = centroid.y / numPoints;

                        let terrainHeight = this.getTerrainHeight(centroid.x, centroid.y);

                        let item = document.createElement("a-entity");
                        let buildingProperties = { primitive: "building", points: wayPoints, terrainHeight: terrainHeight };
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
                        this.mainScene.appendChild(item);
                    }
                }
            }).bind(null, gridSize, groundSize, heightData, zMagnification));
    }

    addTerrainLoadedListener(listener) {
        this.terrainListeners.push(listener);
    }
}

export default new HeightManager();