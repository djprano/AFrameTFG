AFRAME.registerComponent('grow-on-hover', {
  init: function () {
    this.scaleBackup = this.el.getAttribute('scale').clone();
    this.el.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.el.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.el.addEventListener('click', this.handleClick.bind(this));
  },
  handleMouseEnter: function () {
    this.el.setAttribute('scale', {
      x: this.scaleBackup.x * 1.5,
      y: this.scaleBackup.y * 1.5,
      z: this.scaleBackup.z * 1.5
    });
  },
  handleMouseLeave: function () {
    this.el.setAttribute('scale', {
      x: this.scaleBackup.x,
      y: this.scaleBackup.y,
      z: this.scaleBackup.z
    });
  },
  handleClick: function () {
    // Crear una entidad de tipo 'a-text'
    const text = document.createElement('a-text');

    // Configurar propiedades del texto
    text.setAttribute('value', 'Texto de ejemplo');
    text.setAttribute('align', 'center');
    text.setAttribute('color', 'white');
    text.setAttribute('position', '0 0 0');
    text.setAttribute('scale', '0.5 0.5 0.5');
    document.querySelector('#hud').emit('mostrar',text);

  }
});
