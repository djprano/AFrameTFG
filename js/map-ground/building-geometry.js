//Geometría custom para extruir edificios a partir de una superficie y su altura.
AFRAME.registerGeometry('building', {
    schema: {
        height: { type: 'number', default: 10 },
        points: { default: ['-10 10', '-10 -10', '10 -10'], },
        terrainHeight: { type: 'number', default: 0 }
    },
    init: function (data) {
        let shape = new THREE.Shape(data.points);

        let extrudedGeometry = new THREE.ExtrudeGeometry(shape, {
            depth: data.height,
            bevelEnabled: false
        });
        extrudedGeometry.rotateX(Math.PI / 2);
        extrudedGeometry.translate(0, data.height + data.terrainHeight, 0);
        this.geometry = extrudedGeometry;
    }
});
