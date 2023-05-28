AFRAME.registerComponent("track", {
    schema: {
        points: { type: 'array', default: [] },
        id: { type: 'string', default: undefined }
    },
    init: function () {
        // Recuperamos el elemento escena.
        this.sceneEl = document.querySelector("a-scene");

        const material = new THREE.LineBasicMaterial({ 
            color: 0x0000ff ,
            linewidth: 1000,
            fog:false
        });
        this.geometry = new THREE.BufferGeometry().setFromPoints(this.data.points);
        this.geometry.userData = {points:this.data.points};
        let line = new THREE.Line(this.geometry, material);
        this.el.object3D.add(line);
        this.sceneEl.addEventListener('flightCacheData_push_'+this.data.id,(event)=>this.updatePoint(event));
    },

    updatePoint:function(event){
        let newPoint = event.detail; // Nuevo punto a agregar
        let geometry = this.el.object3D.children[0].geometry; // Obtener la geometría existente
        let currentPoints = geometry.userData.points; // Obtener los puntos actuales
        currentPoints.push(newPoint);
        // Actualizar la geometría con los nuevos puntos
        geometry.setFromPoints(currentPoints); 
        geometry.userData = {points:this.data.points};
    }
});
