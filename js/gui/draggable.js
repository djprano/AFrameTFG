AFRAME.registerComponent('draggable', {
  init: function () {
    this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.el.sceneEl.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.el.sceneEl.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.isDragging = false;
    this.cameraEl = this.el.sceneEl.querySelector('#camera'); // referencia al elemento de la cámara
    this.cameraPos= new THREE.Vector3().set(0, 0, 0);
  },
  onMouseDown: function (event) {
    this.isDragging = true;
    this.cameraEl.setAttribute('look-controls', 'enabled', 'false'); // desactivamos look-controls
    this.el.setAttribute('material', 'opacity', 0.2);
  },
  onMouseUp: function (event) {
    this.isDragging = false;
    this.cameraEl.setAttribute('look-controls', 'enabled', 'true'); // volvemos a activar look-controls
    this.el.setAttribute('material', 'opacity', 1);
  },
  onMouseMove: function (event) {
    if (this.isDragging) {
      const dx = event.movementX;
      const dy = event.movementY;
      const scalar = 600;
      let offset = new THREE.Vector3(dx, -dy, 0).divideScalar(scalar);
      this.el.object3D.position.add(offset);
    }
  }
});
