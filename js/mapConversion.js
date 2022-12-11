import * as OpenSkyModel from "./openSkyModel.js";

var displacement;

//Displacement calculation
export function displacementCalculation(){
    
    let longDispDegrees = OpenSkyModel.LONG_MIN+((OpenSkyModel.LONG_MAX - OpenSkyModel.LONG_MIN)/2);
    let latDispDegrees = OpenSkyModel.LAT_MIN+((OpenSkyModel.LAT_MAX - OpenSkyModel.LAT_MIN)/2);
    
    displacement = degreeToMeter(latDispDegrees,longDispDegrees);
}

export function degreeToMeter(lat,long){
    let latlng = new L.latLng(lat, long);
    return L.Projection.Mercator.project(latlng);
}

//Esta función comvierte una coordenada mercator a una coordenada en el mundo 3d
//En el 3d tenemos conversiones de factor , desplazamiento y cambio de ejes.
export function mercatorToWorld(mercatorVector){
    let xWorld = (mercatorVector.x-displacement.x)/OpenSkyModel.FACTOR;
    let yWorld = (mercatorVector.z-displacement.y)/OpenSkyModel.FACTOR;
    let altitudeWorld = mercatorVector.y == null ? 0: mercatorVector.y/OpenSkyModel.FACTOR;

    return {x:xWorld,y:altitudeWorld,z:yWorld};
}

//Convierte los datos del mundo 3D a un vector en mercator en metros
export function worldtoMercator(worldVector){
    let xMercator = (worldVector.x*OpenSkyModel.FACTOR)+displacement.x;
    let yMercator = (worldVector.z*OpenSkyModel.FACTOR)+displacement.y;
    let altitude = worldVector.y*OpenSkyModel.FACTOR;

    return {x:xMercator,y:altitude,z:yMercator};
}


export function createCorner(long, lat,id) {
    //CORNERS MERS
    let entityEl = document.createElement('a-entity');
    entityEl.setAttribute('id', id);
    entityEl.setAttribute('geometry', {
        primitive: 'box',
        width: 100,
        height: 10000,
        depth:100
    });
    let point = degreeToMeter(lat,long);
    let mercator = mercatorToWorld({x:point.x,y:0,z:point.y});
    entityEl.setAttribute('position', mercator);
    mainScene.appendChild(entityEl);
}

