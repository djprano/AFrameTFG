AFRAME.registerComponent('toolbar', {
  init: function () {
    // Creamos el container para la toolbar.
    const toolbar = document.createElement('div');
    toolbar.setAttribute('id', 'toolbar');
    toolbar.style.position = 'absolute';
    toolbar.style.top = '10px';
    toolbar.style.left = '10px';
    toolbar.style.zIndex = '999';

    // Crea los botones

    const hudButton = document.createElement('button');
    hudButton.innerText = 'Hud enable';
    let toggleState = false; // Variable para guardar el estado del botón.
    hudButton.addEventListener('click', () => {
      // Lógica del toogle button
      toggleState = !toggleState; // Cambia el estado del botón.
      this.checkHudEl();
      // Agrega o remueve la clase "button.pressed"
      hudButton.classList.toggle('button.pressed');
      if (toggleState) {
        this.hudEl.emit('hud-enable', null);
        hudButton.innerText = 'Hud enable';
      } else {
        this.hudEl.emit('hud-disable', null);
        hudButton.innerText = 'Hud disable';
      }
    });
    // Agrega los botones al contenedor
    toolbar.appendChild(hudButton);

    // Agrega el contenedor al cuerpo del documento
    document.body.appendChild(toolbar);
  },
  checkHudEl: function () {
    if (this.hudEl == undefined || this.hudEl == null) {
      this.hudEl = document.querySelector('#hud');
    }
  }
});