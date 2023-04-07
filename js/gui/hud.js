const HUD_SHOW_JSON = 'hud-show-json';
const HUD_OBJECT_SELECTED = 'hud-object-selected';
const HUD_DISABLE = 'hud-disable';
const HUD_ENABLE = 'hud-enable';

AFRAME.registerComponent('hud', {
  init: function () {
    // Controla si está habilidato el hud.
    this.disable = false;

    //Guardamos la cámara principal.
    this.camera = document.querySelector('#camera');

    //Creamos la cámara secundaria
    // Crear una nueva cámara y agregarla al objeto seleccionado.
    this.cameraEl = document.createElement('a-entity');
    this.cameraEl.setAttribute('camera', {
      active: false // La cámara no está activa inicialmente
    });
    this.cameraEl.setAttribute('position', '0 0 0');
    

    // Crear el elemento del HUD y añadirlo a la escena.
    this.hudEl = document.createElement('a-entity');
    this.hudEl.setAttribute('id', 'hud');
    this.hudEl.setAttribute('position', '0 0 -1');
    this.hudEl.setAttribute('scale', '0.4 0.4 1');
    this.hudEl.setAttribute('visible', 'false');
    this.hudEl.setAttribute('class', "clickable");
    this.hudEl.setAttribute('raycaster-ignore', false);
    this.hudEl.setAttribute('class', 'clickable'); // Agrega la clase 'clickable'
    this.hudEl.setAttribute('draggable', '');


    // Crear un fondo transparente para el HUD.
    var backgroundEl = document.createElement('a-plane');
    backgroundEl.setAttribute('color', '#000');
    backgroundEl.setAttribute('opacity', '0.4');
    backgroundEl.setAttribute('width', '2');
    backgroundEl.setAttribute('height', '1.5');
    backgroundEl.setAttribute('class', "clickable");
    backgroundEl.setAttribute('draggable');

    this.hudEl.appendChild(backgroundEl);

    // Crear un botón close para el HUD.
    let closeButtonEl = this.createCloseButton();
    let cameraOnBoard = this.createCameraOnBoardButton();

    this.hudEl.appendChild(closeButtonEl);
    this.hudEl.appendChild(cameraOnBoard);

    // Crear un contenedor para el contenido del HUD.
    this.contentEl = document.createElement('a-entity');
    this.contentEl.setAttribute('id', 'hud-content');
    this.contentEl.setAttribute('position', '0 0 0');
    this.contentEl.setAttribute('raycaster-ignore', true);
    this.hudEl.appendChild(this.contentEl);

    this.el.appendChild(this.hudEl);

    // Registrar el evento 'mostrar' para mostrar el HUD.
    this.hudEl.addEventListener('hud-show', (event) => {
      this.showData(event.detail);
    });

    // Registrar el evento 'mostrar json' para mostrar el HUD.
    this.hudEl.addEventListener(HUD_SHOW_JSON, (event) => {
      this.showData(this.json2TextComponent(event.detail));
    });

    // Registrar el evento 'ocultar' para ocultar el HUD.
    this.hudEl.addEventListener('hud-hide', () => {
      this.hideData();
    });

    // Registrar el evento 'mostrar un marcador en el objeto seleccionado'.
    this.hudEl.addEventListener(HUD_OBJECT_SELECTED, (event) => {
      this.objectSelected(event.detail);
    });

    // Registrar el evento 'deshabilitar hud'.
    this.hudEl.addEventListener(HUD_DISABLE, (event) => {
      this.disableHud();
    });

    // Registrar el evento 'habilitar hud'.
    this.hudEl.addEventListener(HUD_ENABLE, (event) => {
      this.enableHud();
    });

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
    this.hudEl.setAttribute('visible', 'true');
  },
  hideData() {
    //Comprobamos que está habilitado el hud.
    if (this.disable) return;
    // Vaciar el contenido del HUD.
    this.contentEl.innerHTML = '';

    // Ocultar el HUD.
    this.hudEl.setAttribute('visible', 'false');

    //Borramos el selector.
    this.objSelected.removeChild(this.ring);
    this.objSelected = null;
  }
  ,
  json2TextComponent: function (jsonData) {
    // Crear un elemento de texto para cada posición del array.
    let jsonEl = document.createElement('a-entity');
    jsonEl.setAttribute('id', 'jsonEl');
    jsonEl.setAttribute('position', '0 0 0');
    jsonEl.setAttribute('raycaster-ignore', true);
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
    closeButtonText.setAttribute('raycaster-ignore', true);
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
      shader: 'flat' // Establece el shader a flat
    });
    closeButtonEl.appendChild(closeButtonText);
    closeButtonEl.setAttribute('position', '-0.3 -0.6 0');
    closeButtonEl.setAttribute('rotation', '0 0 0');
    closeButtonEl.addEventListener('click', () => this.hideData());
    closeButtonEl.setAttribute('raycaster-ignore', false);
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
    cameraOnBoardButtonText.setAttribute('raycaster-ignore', true);
    //Creamos el botón
    let cameraOnBoardButtonEl = document.createElement('a-entity');
    cameraOnBoardButtonEl.setAttribute('id', 'hud-close-button');
    cameraOnBoardButtonEl.setAttribute('geometry', {
      primitive: 'box',
      width: 0.6,
      height: 0.1,
      depth: 0.002
    });
    cameraOnBoardButtonEl.setAttribute('material', {
      color: '#FF5722',
      shader: 'flat' // Establece el shader a flat
    });
    cameraOnBoardButtonEl.appendChild(cameraOnBoardButtonText);
    cameraOnBoardButtonEl.setAttribute('position', '0.3 -0.6 0');
    cameraOnBoardButtonEl.setAttribute('rotation', '0 0 0');
    cameraOnBoardButtonEl.addEventListener('click', () => this.cameraOnBoard());
    cameraOnBoardButtonEl.setAttribute('raycaster-ignore', false);
    cameraOnBoardButtonEl.setAttribute('class', 'clickable'); // Agrega la clase 'clickable'
    return cameraOnBoardButtonEl;
  },
  cameraOnBoard:function(){
    this.objSelected.appendChild(this.cameraEl);
    this.cameraEl.setAttribute('active', true);
    this.camera.setAttribute('camera', {active: false});
  }
});



