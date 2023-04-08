AFRAME.registerComponent('toolbar', {
  init: function () {
    // Recuperamos el elemento escena.
    this.sceneEl = document.querySelector("a-scene");

    // Creamos los listener de eventos.
    // Registrar el evento 'mostrar botón exit on board' para mostrar el HUD.
    this.sceneEl.addEventListener('toolbar-show-exitOnBoardButton', (event) => {
      this.exitOnBoardButton.style.display = 'inline-block'; // Mostrar el botón
    });

    // Registrar el evento 'mostrar botón exit on board' para mostrar el HUD.
    this.sceneEl.addEventListener('toolbar-hide-exitOnBoardButton', (event) => {
      this.exitOnBoardButton.style.display = 'none'; // ocultar el botón
    });

    // Creamos el container para la toolbar.
    const toolbar = document.createElement('div');
    toolbar.setAttribute('id', 'toolbar');
    toolbar.style.position = 'absolute';
    toolbar.style.top = '10px';
    toolbar.style.left = '10px';
    toolbar.style.zIndex = '999';
    

    // Crea los botones
    // creamos el botón para la camera on board
    this.exitOnBoardButton = this.createExitOnBoard();

    // creamos el botón para el hud
    const hudButton = this.createHudButton();
    // Agrega los botones al contenedor
    toolbar.appendChild(hudButton);
    toolbar.appendChild(this.exitOnBoardButton);

    // Agrega el contenedor al cuerpo del documento
    document.body.appendChild(toolbar);
  },
  createExitOnBoard:function(){
    const button = document.createElement('button');
    button.innerText = 'Exit on board';
    button.style.marginRight = '5px';
    button.style.display = 'none'; // Ocultar el botón
    button.addEventListener('click', () => {
      this.sceneEl.emit('hud-exit-onBoard', null);
      button.style.display = 'none'; // Ocultar el botón
    });
    return button;
  },
  createHudButton:function(){
    const button = document.createElement('button');
    button.innerText = 'Hud disable';
    button.style.marginRight = '5px';
    let hudButtonEnable = false; // Variable para guardar el estado del botón.
    button.classList.toggle('buttonDisable');
    button.addEventListener('click', () => {
      // Lógica del toogle button
      hudButtonEnable = !hudButtonEnable; // Cambia el estado del botón.

      // Agrega o remueve la clase "buttonPressed"
      button.classList.toggle('buttonDisable');
      button.classList.toggle('buttonEnable');

      if (hudButtonEnable) {
        this.sceneEl.emit('hud-enable', null);
        button.innerText = 'Hud enable';
      } else {
        this.sceneEl.emit('hud-disable', null);
        button.innerText = 'Hud disable';
      }
    });
    return button;
  }
});