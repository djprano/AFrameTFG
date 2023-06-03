/*****Constantes****/
const intervalTime = 200;

AFRAME.registerComponent('hover-scale', {
    schema: {
        maxScale: { type: 'number', default: 1.2 },
        maxDistance: { type: 'number', default: 1 }
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

    invertalEvent: function () {
      // Escalar la entidad según la distancia
      this.distance = this.camera.getAttribute('position').distanceTo(this.el.getAttribute('position'));
      let newScale = Math.min(this.distance / 10, this.data.maxScale); // Limitar la escala máxima
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
  