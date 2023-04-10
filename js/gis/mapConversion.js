import * as OpenSkyModel from "../configuration/openSkyModel.js";

class MapConversion {
    constructor() {
        let longDispDegrees = OpenSkyModel.LONG_MIN + ((OpenSkyModel.LONG_MAX - OpenSkyModel.LONG_MIN) / 2);
        let latDispDegrees = OpenSkyModel.LAT_MIN + ((OpenSkyModel.LAT_MAX - OpenSkyModel.LAT_MIN) / 2);
        this.displacement = this.degreeToMeter(latDispDegrees, longDispDegrees);
    }
    degreeToMeter(lat, long) {
        let latlng = new L.latLng(lat, long);
        return L.Projection.Mercator.project(latlng);
    }
    meterToDegree(mercatorVector) {
        let point = { x: mercatorVector.x, y: mercatorVector.z };
        return L.Projection.Mercator.unproject(point);
    }
    //Esta función comvierte una coordenada mercator a una coordenada en el mundo 3d
    //En el 3d tenemos conversiones de factor , desplazamiento y cambio de ejes.
    mercatorToWorld(mercatorVector) {
        let xWorld = (mercatorVector.x - this.displacement.x) / OpenSkyModel.FACTOR;
        let yWorld = (mercatorVector.z - this.displacement.y) / OpenSkyModel.FACTOR;
        let altitudeWorld = mercatorVector.y == null ? 0 : mercatorVector.y / OpenSkyModel.FACTOR;

        return { x: xWorld, y: altitudeWorld, z: -yWorld };
    }

    //Convierte los datos del mundo 3D a un vector en mercator en metros
    worldtoMercator(worldVector) {
        let xMercator = (worldVector.x * OpenSkyModel.FACTOR) + this.displacement.x;
        let yMercator = (-worldVector.z * OpenSkyModel.FACTOR) + this.displacement.y;
        let altitude = worldVector.y * OpenSkyModel.FACTOR;

        return { x: xMercator, y: altitude, z: yMercator };
    }

    //función que convierte una coordenada WGS84 en grados en un vector del escenario con sus transformaciones afines.
    degreeToWorld(lat, long) {
        let point = this.degreeToMeter(lat, long);
        return this.mercatorToWorld({ x: point.x, y: 0, z: point.y });
    }

    //función que convierte una coordenada del escenario a la coordenada correspondiente a WGS84 en grados.
    worldToDegree(worldVector) {
        let mercatorVector = this.worldtoMercator(worldVector);
        return this.meterToDegree(mercatorVector);
    }

    createCorner(long, lat, id, mainScene) {
        //CORNERS MERS
        let entityEl = document.createElement('a-entity');
        entityEl.setAttribute('id', id);
        entityEl.setAttribute('geometry', {
            primitive: 'box',
            width: 10,
            height: 9000,
            depth: 10
        });
        let point = this.degreeToMeter(lat, long);
        let mercator = this.mercatorToWorld({ x: point.x, y: 0, z: point.y });
        entityEl.setAttribute('position', mercator);
        mainScene.appendChild(entityEl);
    }

    getGroundSize() {

        let latlongMax = this.degreeToMeter(OpenSkyModel.LAT_MAX, OpenSkyModel.LONG_MAX);
        let sizeMeters = this.mercatorToWorld({ x: latlongMax.x, y: 0, z: latlongMax.y });
        return {
            width: Math.abs(sizeMeters.x * 2),
            height: Math.abs(sizeMeters.z * 2)
        };
    }
}

export default new MapConversion();
