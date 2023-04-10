import * as MapConversion from "../gis/mapConversion.js";
import * as OpenSkyModel from "../configuration/openSkyModel.js";

MapConversion.displacementCalculation();

const mainScene = document.querySelector('a-scene');

//Crea un plano con la imagen correspondiente al mapa, tan solo es una referencia.
export function createMapGround() {
    let groundSize = MapConversion.getGroundSize();
    let terrainEl = document.createElement('a-entity');
    terrainEl.setAttribute('id', "terrain");
    let atributes = {
        wireframe: true,
        map: 'url(data/vatry_map.png)',
        dem: 'url(data/smallMap.bin)',
        planeWidth: groundSize.width,
        planeHeight: groundSize.height,
        segmentsWidth: 199,
        segmentsHeight: 199,
        zPosition: 350
    };
    terrainEl.setAttribute('terrain-model', atributes);
    mainScene.appendChild(terrainEl);
    terrainEl.addEventListener("demLoaded", evt => {
        let heightData = evt.target.components['terrain-model'].heightData;
        createBuildings(heightData, MapConversion.getGroundSize(), { height: atributes.segmentsHeight, width: atributes.segmentsWidth }, atributes.zPosition);
    });

    //ajuste de la esfera de cielo
    let skyEl = document.getElementById("sky");
    skyEl.setAttribute("radius", Math.min(groundSize.width, groundSize.height) / 2);
}

//Carga los datos de la terminal del aeropuerto y genera las geometrías custom de los edificios.
function createBuildings(heightData, groundSize, gridSize, zMagnification) {

    // createVertexDebug(heightData,gridSize,groundSize,zMagnification);

    fetch('..//data//' + OpenSkyModel.BUILDING_FILE_NAME + '.geojson')
        .then((response) => response.json())
        .then(((gridSize, groundSize, heightData, zMagnification, itemJSON) => {
            let maxBuildings = 10000;
            //calculos previos para convertir posición 3D a posicion array de alturas
            let cellSize = { width: groundSize.width / gridSize.width, height: groundSize.height / gridSize.height }

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
                    let numPoints = 0;
                    let centroid = { x: 0, y: 0 };
                    for (let way of feature.geometry.coordinates) {
                        for (let point of way) {
                            let pointMeter = MapConversion.degreeToMeter(point[1], point[0]);//point[1] lat ; point[0] long
                            let mercatorVector = { x: pointMeter.x, y: 0, z: pointMeter.y };
                            let point3d = MapConversion.mercatorToWorld(mercatorVector);
                            wayPoints.push({ x: point3d.x, y: point3d.z });
                            centroid.x = centroid.x + point3d.x;
                            centroid.y = centroid.y + point3d.z;
                            numPoints++;
                        }
                    }
                    //Calculo del centroide del edificio
                    centroid.x = centroid.x / numPoints;
                    centroid.y = centroid.y / numPoints;

                    //Conversión inversa
                    let indexX = Math.round((centroid.x + (groundSize.width / 2)) / (cellSize.width));
                    let indexY = Math.round((centroid.y + (groundSize.height / 2)) / (cellSize.height));
                    let index = (indexY * (gridSize.width + 1)) + indexX;

                    let terrainHeight = zMagnification * (heightData[index] / 65535);//se divide entre 2^16 debido a que es un Uint16Array

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
                    mainScene.appendChild(item);
                }
            }
        }).bind(null, gridSize, groundSize, heightData, zMagnification));
}