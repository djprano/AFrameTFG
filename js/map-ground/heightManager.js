import mapConversion from "../gis/mapConversion.js";
import * as configuration from "../configuration/configurationModel.js";

class HeightManager {

    //**Constructor */
    constructor() {
        this.mainScene = document.querySelector('a-scene');
        this.zMagnification = 120;
        this.terrainListeners = [];
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
    }

    indexToHeight(index) {
        return this.zMagnification * (this.heightData[index] / 65535);//se divide entre 2^16 debido a que es un Uint16Array
    }

    getTerrainHeight(x, y) {
        return this.getTerrainHeight(x, y, false);
    }
    /**
     * Calcula la altura en función de su coordenadas 3d.
     * @param {*} x coordenada x de la posición de la que se quiere saber la altura.
     * @param {*} y coordenada y de la posición de la que se quiere saber la altura.
     * @param {*} hightPrecision booleano que indica si queremos calcular la altura para posiciones intermedias con alta precisión.
     * @returns el valor de la altura.
     */
    getTerrainHeight(x, y, hightPrecision) {
        //Cálculo de indice de la matríz de alturas.
        let indexX = Math.round((x + (this.groundSize.width / 2)) / (this.cellSize.width));
        let indexY = Math.round((y + (this.groundSize.height / 2)) / (this.cellSize.height));
        let index = (indexY * (this.gridSize.width + 1)) + indexX;
        let height = this.indexToHeight(index);
        if (hightPrecision) {
            // Creamos un raycaster desde la posición de la cámara y en dirección hacia arriba
            let raycasterPos = new THREE.Vector3(x, height + 100, y);
            this.raycaster.ray.origin.copy(raycasterPos);

            // Calculamos las intersecciones entre el raycaster y la malla
            const intersects = this.raycaster.intersectObject(this.mesh);
            let intersection = undefined;
            // Si hay una intersección, ajustamos la posición de la cámara
            if (intersects.length > 0) {
                // Obtenemos la posición de la intersección
                intersection = intersects[0].point;
            }
            return intersection !== undefined ? intersection.y : height;
        } else {
            return height;
        }
    }

    /**
     * Crea un plano con la imagen correspondiente al mapa, tan solo es una referencia.
     */
    createMapGround() {
        this.groundSize = mapConversion.getGroundSize();
        let terrainEl = document.createElement('a-entity');
        terrainEl.setAttribute('id', "terrain");
        let atributes = {
            wireframe: false,
            map: 'url(data/' + configuration.mapRasterFile + ')',
            dem: 'url(data/' + configuration.mapDemFile + ')',
            planeWidth: this.groundSize.width,
            planeHeight: this.groundSize.height,
            segmentsWidth: 199,
            segmentsHeight: 199,
            zPosition: this.zMagnification
        };
        //calculos previos para convertir posición 3D a posicion array de alturas
        this.gridSize = { height: atributes.segmentsHeight, width: atributes.segmentsWidth };
        this.cellSize = { width: this.groundSize.width / this.gridSize.width, height: this.groundSize.height / this.gridSize.height }

        terrainEl.setAttribute('terrain-model', atributes);
        this.mainScene.appendChild(terrainEl);
        terrainEl.addEventListener("demLoaded", evt => {
            this.heightData = evt.target.components['terrain-model'].heightData;
            this.mesh = evt.target.components['terrain-model'].mesh;
            this.createBuildings(this.heightData, mapConversion.getGroundSize(), this.gridSize, atributes.zPosition);
            this.terrainListeners.forEach(listener => listener());
            //calculamos la media de todas las alturas
            this.calculateAverageHeight();
        });

        //ajuste de la esfera de cielo
        let skyEl = document.getElementById("sky");
        skyEl.setAttribute("radius", Math.min(this.groundSize.width, this.groundSize.height) / 2);
    }

    /**
     * Calcula el promedio ded alturas evitando desbordamientos.
     */
    calculateAverageHeight(){
        this.average = 0;
        for (let i = 0; i < this.heightData.length; i++) {
            this.average += (this.indexToHeight(i) - this.average) / (i + 1);
        }
    }

    /**
     * Responsable de devolver el dato del promedio de todas las alturas precalculado.
     * @returns La media de la altura precalculada.
     */
    getAverageHeight(){
        return this.average;
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
        let dataUrl = new URL('../../data/' + configuration.buildingFileName + '.geojson', import.meta.url);

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
                        let metersByLevel = 6;
                        let height;
                        //prioridad a la propiedad altura si no usamos 
                        if (featureHeight != undefined && featureHeight != null) {
                            height = featureHeight;
                        } else {
                            height = levels != undefined ? levels * metersByLevel : 70;
                        }
                        buildingProperties.height = height / configuration.FACTOR;
                        item.setAttribute("id", feature.id);
                        item.setAttribute("geometry", buildingProperties);
                        item.setAttribute("material", { color: '#88e9fd', roughness: 0.8, metalness: 0.5 });
                        let infoValue = feature.properties.source;
                        if (infoValue != null && infoValue != undefined) {
                            item.setAttribute('tooltip-info', { info: infoValue });
                            item.setAttribute('class', "clickable");
                        }
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