/*****Constantes****/
const intervalTime = 500;

AFRAME.registerComponent('hover-scale', {
    schema: {
        limitDistance: { type: 'number', default: 1 }
      },
    init: function () {
      this.originalScale = this.el.getAttribute('scale').clone();
      this.camera = document.querySelector('[camera]');
      
      // Registrar eventos de hover
      this.el.addEventListener('mouseenter', this.onMouseEnter.bind(this));
      this.el.addEventListener('mouseleave', this.onMouseLeave.bind(this));
      this.throttledFunction = AFRAME.utils.throttle(this.invertalEvent, intervalTime, this);
    },
    
    onMouseEnter: function () {
      // Calcular la distancia entre la entidad y el cursor
      
    },
    
    onMouseLeave: function () {
      // Restaurar escala original
    },

    getFactor: function(distance){
      return ((distance - this.data.limitDistance)/55) + 1;
    },

    invertalEvent: function () {
      // Escalar la entidad según la distancia
      // Obtener la posición actual de la cámara
      let camPos = this.camera.object3D.position;
      // Posición del padre de la cámara
      let rigPos = this.camera.parentEl.object3D.position;
      const position = (new THREE.Vector3(0, 0, 0)).copy(camPos).add(rigPos);
      this.distance = position.distanceTo(this.el.getAttribute('position'));
      let newScale = this.distance < this.data.limitDistance ? 1 : this.getFactor(this.distance);// Limitar la escala máxima
      this.el.setAttribute('scale', {
        x: this.originalScale.x * newScale,
        y: this.originalScale.y * newScale,
        z: this.originalScale.z * newScale
      });
    },
    
    tick: function () {
      this.throttledFunction();
    }
  });
  