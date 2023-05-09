AFRAME.registerComponent('custom-draggable', {
  init: function () {

    let zPos = Math.abs(this.el.object3D.position.z);
    this.enablePosition = new THREE.Vector3(0, 0, -zPos);
    this.disabledPosition = new THREE.Vector3(0, 0, zPos);

    this.raycasterEl = this.el.querySelector('[raycaster]');
    //mouse
    this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.el.addEventListener('mouseup', this.onMouseUp.bind(this));

    this.isDragging = false;

    this.el.addEventListener('raycaster-intersected', evt => {
      if (!this.isDragging) {
        this.raycaster = evt.detail.el;
      }
    });

    this.cameraEl = this.el.sceneEl.querySelector('#camera'); // referencia al elemento de la cámara

    this.previousPosition = new THREE.Vector3();
    this.currentPosition = new THREE.Vector3();
    this.intersection = new THREE.Vector3();
    this.createFakePlane();
  },
  createFakePlane: function () {
    // Crear el plano clickcable
    let fakePlane = document.querySelector('#fakePlane');
    if(fakePlane != null && fakePlane != undefined){
      this.plane = fakePlane;
    }else{
      this.plane = document.createElement('a-plane');
      this.plane.setAttribute('id', 'fakePlane');
      this.plane.setAttribute('width', '20');
      this.plane.setAttribute('height', '20');
      this.plane.setAttribute('visible', 'false');
      this.plane.setAttribute('class', "clickable");
      this.plane.object3D.position.copy(this.disabledPosition);
      this.cameraEl.appendChild(this.plane);
    }
  }
  ,
  onMouseDown: function (event) {
    this.cameraEl.setAttribute('look-controls', 'enabled', 'false'); // desactivamos look-controls
    this.plane.object3D.position.copy(this.enablePosition);
    this.isDragging = true;
    this.backupOpacity = this.el.getAttribute('material').opacity;
    const draggingOpacity = 0.15;
    if (draggingOpacity < this.backupOpacity) {
      this.el.setAttribute('material', 'opacity', draggingOpacity);
    }
    if (this.raycaster != null) {
      const intersect = this.raycaster.components.raycaster.getIntersection(this.el);
      if (intersect != null) {
        const positionRelative = this.cameraEl.object3D.worldToLocal(intersect.point.clone());
        this.previousPosition.copy(positionRelative);
      }
    }

  },
  onMouseUp: function (event) {
    this.isDragging = false;
    this.cameraEl.setAttribute('look-controls', 'enabled', 'true'); // volvemos a activar look-controls
    this.plane.object3D.position.copy(this.disabledPosition);
    if (this.backupOpacity != null && this.backupOpacity != undefined)
      this.el.setAttribute('material', 'opacity', this.backupOpacity);
      this.backupOpacity = null;
  },
  tick: function () {
    if (this.isDragging && this.raycaster != null) {
      const intersect = this.raycaster.components.raycaster.getIntersection(this.plane);
      if (intersect != null) {
        const positionRelative = this.cameraEl.object3D.worldToLocal(intersect.point.clone());
        this.currentPosition.copy(positionRelative);
        const displacement = new THREE.Vector3().subVectors(this.currentPosition, this.previousPosition);
        this.el.object3D.position.add(displacement);
        this.previousPosition.copy(this.currentPosition);
      }
    }
  }
});
