AFRAME.registerComponent('hud', {
  init: function () {
    // Recuperamos el elemento escena.
    this.sceneEl = document.querySelector("a-scene");
    // Controla si está habilidato el hud.
    this.disable = true;

    //Guardamos la cámara principal.
    this.camera = document.querySelector('#camera');

    // Creamos la posición deshabilitado y habilitado
    this.enableHudPosition = new THREE.Vector3(0, 0, -2);
    this.disableHudPosition = new THREE.Vector3(0, 0, 2);

    // Crear el elemento del HUD y añadirlo a la escena.
    this.hudEl = document.createElement('a-plane');
    this.hudEl.setAttribute('id', 'hud');
    this.hudEl.object3D.position.copy(this.disableHudPosition);
    this.hudEl.setAttribute('scale', '0.4 0.4 1');
    this.hudEl.setAttribute('visible', 'false');
    this.hudEl.setAttribute('class', "clickable");
    this.hudEl.setAttribute('width', 3);
    this.hudEl.setAttribute('height', 2);
    this.hudEl.setAttribute('color', '#000');
    this.hudEl.setAttribute('opacity', '0.4');
    this.hudEl.setAttribute('custom-draggable', '');
    this.hudEl.setAttribute('look-at', '#camera');

    // Crear un botón close para el HUD.
    let closeButtonEl = this.createCloseButton();
    
    let cameraOnBoard = this.createCameraOnBoardButton();

    this.hudEl.appendChild(closeButtonEl);
    this.hudEl.appendChild(cameraOnBoard);

    // Crear un contenedor para el contenido del HUD.
    this.contentEl = document.createElement('a-entity');
    this.contentEl.setAttribute('id', 'hud-content');
    this.contentEl.setAttribute('position', '0 0 0');
    this.hudEl.appendChild(this.contentEl);

    // Registrar el evento 'mostrar' para mostrar el HUD.
    this.sceneEl.addEventListener('hud-show', (event) => {
      this.showData(event.detail);
    });

    // Registrar el evento 'mostrar json' para mostrar el HUD.
    this.sceneEl.addEventListener('hud-show-json', (event) => {
      this.showData(this.json2TextComponent(event.detail));
    });

    // Registrar el evento 'ocultar' para ocultar el HUD.
    this.sceneEl.addEventListener('hud-hide', () => {
      this.hideData();
    });

    // Registrar el evento 'mostrar un marcador en el objeto seleccionado'.
    this.sceneEl.addEventListener('hud-object-selected', (event) => {
      this.objectSelected(event.detail);
    });

    // Registrar el evento 'deshabilitar hud'.
    this.sceneEl.addEventListener('hud-disable', (event) => {
      this.disableHud();
    });

    // Registrar el evento 'habilitar hud'.
    this.sceneEl.addEventListener('hud-enable', (event) => {
      this.enableHud();
    });

    // Registrar el evento 'exit camera on board'.
    this.sceneEl.addEventListener('hud-exit-onBoard', (event) => {
      this.exitCameraOnBoard();
    });

    //Agregamos el hud a la camara.
    this.el.appendChild(this.hudEl);

  },
  /**
   * Función que crea una entidad anillo para señalar el objeto seleccionado
   * en el que se muestra la información en el hud.
   */
  createRing: function () {
    this.ring = document.createElement('a-entity');
    this.ring.setAttribute('geometry', { primitive: 'ring', radiusInner: 1, radiusOuter: 1.2 });
    this.ring.setAttribute('material', { color: 'red', shader: 'flat' });
    this.ring.setAttribute('position', '0 15 0'); // posicion relativa
    this.ring.setAttribute('scale', '20 20 1');
    this.ring.setAttribute('rotation', '0 -180 0');
    this.ring.setAttribute('look-at', '#camera');
  }
  ,
  /**
   * Evento para señalar el elemento data con una geometría que indique que está señalado.
   * @param {HTMLElement} data elemento seleccionado del que vamos a mostrar la información en el hud.
   */
  objectSelected: function (data) {
    //Comprobamos que está habilitado el hud.
    if (this.disable) return;

    if (this.objSelected != undefined && this.objSelected != null) {
      this.objSelected.removeChild(this.ring);
    }
    //creamos el anillo de selección.
    this.createRing();
    data.appendChild(this.ring);
    this.objSelected = data;
  }
  ,
  disableHud: function () {
    this.hideData();
    this.disable = true;
  }
  ,
  enableHud: function () {
    this.disable = false;
  }
  ,
  showData: function (data) {
    //Comprobamos que está habilitado el hud.
    if (this.disable) return;
    // Vaciar el contenido anterior del HUD.
    this.contentEl.innerHTML = '';

    // Añadir el contenido recibido del evento al HUD.
    this.contentEl.appendChild(data);

    // Mostrar el HUD.
    this.hudEl.object3D.position.copy(this.enableHudPosition);
    this.hudEl.setAttribute('visible', 'true');
  },
  hideData() {
    //Ocultamos el botón de on board de la toolbar por si está visible.
    this.sceneEl.emit('toolbar-hide-exitOnBoardButton', null);

    // Vaciar el contenido del HUD.
    this.contentEl.innerHTML = '';

    // Ocultar el HUD.
    this.hudEl.setAttribute('visible', 'false');
    this.enableHudPosition.copy(this.hudEl.object3D.position);
    this.hudEl.object3D.position.copy(this.disableHudPosition);


    //Borramos el selector.
    if (this.objSelected != null) {
      if (this.cameraEl !== null && this.cameraEl !== undefined) {
        this.exitCameraOnBoard();
      }
      this.objSelected.removeChild(this.ring);
      this.objSelected = null;
    }

  }
  ,
  json2TextComponent: function (jsonData) {
    // Crear un elemento de texto para cada posición del array.
    let jsonEl = document.createElement('a-entity');
    jsonEl.setAttribute('id', 'jsonEl');
    jsonEl.setAttribute('position', '0 0 0');
    for (let propiedad in jsonData) {
      let textEl = document.createElement('a-text');
      let value = propiedad + ': ' + jsonData[propiedad];
      textEl.setAttribute('value', propiedad + ': ' + jsonData[propiedad]);
      textEl.setAttribute('position', '-0.3a ' + (-0.1 * Object.keys(jsonData).indexOf(propiedad) + 0.5) + ' 0');
      textEl.setAttribute('height', 2);
      textEl.setAttribute('width', 2);
      textEl.setAttribute('align', 'left');
      textEl.setAttribute('color', 'white');
      jsonEl.appendChild(textEl);
    }
    return jsonEl;
  },
  createCloseButton: function () {
    let closeButtonText = document.createElement('a-entity');
    closeButtonText.setAttribute('text', {
      value: 'Close',
      align: 'center',
      width: 1.5,
      color: '#FFFFFF',
    });
    closeButtonText.setAttribute('position', '0 0 0.001');
    //Creamos el botón
    let closeButtonEl = document.createElement('a-entity');
    closeButtonEl.setAttribute('id', 'hud-close-button');
    closeButtonEl.setAttribute('geometry', {
      primitive: 'box',
      width: 0.3,
      height: 0.1,
      depth: 0.002
    });
    closeButtonEl.setAttribute('material', {
      color: '#FF5722',
      shader: 'flat' // Establece el shader a flat para no terner efectos de iluminación.
    });
    closeButtonEl.appendChild(closeButtonText);
    closeButtonEl.setAttribute('position', '-0.3 -0.6 0');
    closeButtonEl.setAttribute('rotation', '0 0 0');
    closeButtonEl.addEventListener('click', () => this.hideData());
    closeButtonEl.setAttribute('class', 'clickable'); // Agrega la clase 'clickable'
    return closeButtonEl;
  },
  createCameraOnBoardButton: function () {
    let cameraOnBoardButtonText = document.createElement('a-entity');
    cameraOnBoardButtonText.setAttribute('text', {
      value: 'Camera on board',
      align: 'center',
      width: 1.5,
      color: '#FFFFFF',
    });
    cameraOnBoardButtonText.setAttribute('position', '0 0 0.001');
    //Creamos el botón
    let cameraOnBoardButtonEl = document.createElement('a-entity');
    cameraOnBoardButtonEl.setAttribute('id', 'hud-cameraOnBoard-button');
    cameraOnBoardButtonEl.setAttribute('geometry', {
      primitive: 'box',
      width: 0.6,
      height: 0.1,
      depth: 0.002
    });
    cameraOnBoardButtonEl.setAttribute('material', {
      color: '#FF5722',
      shader: 'flat' // Establece el shader a flat para que no tenga efectos de iluminación.
    });
    cameraOnBoardButtonEl.appendChild(cameraOnBoardButtonText);
    cameraOnBoardButtonEl.setAttribute('position', '0.3 -0.6 0');
    cameraOnBoardButtonEl.setAttribute('rotation', '0 0 0');
    cameraOnBoardButtonEl.addEventListener('click', () => this.cameraOnBoard());
    cameraOnBoardButtonEl.setAttribute('class', 'clickable'); // Agrega la clase 'clickable'
    return cameraOnBoardButtonEl;
  },
  cameraOnBoard: function () {
    //Activamos el botón de salir
    this.sceneEl.emit('toolbar-show-exitOnBoardButton', null);
    //Desactivamos el ring
    this.ring.setAttribute('visible', false);
    //Desactivamos los eventos
    this.disable = true;
    //Creamos la cámara secundaria
    // Crear una nueva cámara y agregarla al objeto seleccionado.
    this.cameraEl = document.createElement('a-entity');
    this.cameraEl.setAttribute('camera', {
      active: false // La cámara no está activa inicialmente
    });

    // Copiamos los atributos de la cámara principal en la secundaria menos la posición y el control.

    Array.from(this.camera.attributes).forEach(attribute => {
      let name = attribute.name;
      let value = attribute.value;
      if (name !== 'position' && name !== 'wasd-controls' && name !== 'id' && name !== 'camera' && name !== 'hud') {
        this.cameraEl.setAttribute(name, value);
      }
    });
    this.cameraEl.setAttribute('position', '0 0 0');

    this.objSelected.appendChild(this.cameraEl);
    this.cameraEl.setAttribute('active', true);
    this.camera.setAttribute('camera', { active: false });
  },
  exitCameraOnBoard: function () {
    //Activamos el ring
    this.ring.setAttribute('visible', true);
    //Activamos los eventos
    this.disable = false;
    this.camera.setAttribute('camera', { active: true });
    this.cameraEl.setAttribute('active', false);
  }
});



