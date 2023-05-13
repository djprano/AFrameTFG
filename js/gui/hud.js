AFRAME.registerComponent('hud', {
  init: function () {
    // Recuperamos el elemento escena.
    this.sceneEl = document.querySelector("a-scene");

    // Controla si está habilidato el hud.
    this.disable = true;
    //Controla si el panel del hud se está mostrando.
    this.showed = false;

    //Guardamos la cámara principal.
    this.camera = document.querySelector('#camera');

    // Creamos la posición deshabilitado y habilitado
    this.enableHudPosition = new THREE.Vector3(0, 0.1, -2);
    this.disableHudPosition = new THREE.Vector3(0, 0, 2);

    // Crear el elemento del HUD y añadirlo a la escena.
    this.hudEl = document.createElement('a-plane');
    this.hudEl.setAttribute('id', 'hud');
    this.hudEl.object3D.position.copy(this.disableHudPosition);
    this.hudEl.setAttribute('scale', '0.6 0.6 1');
    this.hudEl.setAttribute('visible', 'false');
    this.hudEl.setAttribute('class', "clickable");
    this.hudEl.setAttribute('width', 1.9);
    this.hudEl.setAttribute('height', 2.2);
    this.hudEl.setAttribute('color', '#000');
    this.hudEl.setAttribute('opacity', '0.4');
    this.hudEl.setAttribute('custom-draggable', '');
    this.hudEl.setAttribute('look-at', '#camera');


    // Crear un botón close para el HUD.
    this.closeButtonEl = this.createHudButton('hud-close-button',0.4, 0.2, 0.4,{ x: -0.485, y: -0.85, z: 0.01 },false,
      () => true,
      () => this.hideData(), null,
      '#000', '#000', 'Close', null);
    this.cameraOnBoardButtonEl = this.createHudButton('hud-cameraOnBoard-button',0.8, 0.2, 0.4,{ x: 0.30, y: -0.85, z: 0.01 },true,
    () => this.objSelected!=null && this.objSelected != undefined,
    () => this.cameraOnBoard(), 
    () => this.exitCameraOnBoard(),
    '#111', '#000', 'Close on board', 'Camera on board');

    this.hudEl.appendChild(this.closeButtonEl);
    this.hudEl.appendChild(this.cameraOnBoardButtonEl);

    // Crear un contenedor para el contenido del HUD.
    this.contentEl = document.createElement('a-entity');
    this.contentEl.setAttribute('id', 'hud-content');
    this.contentEl.setAttribute('position', '0 0 0');
    this.hudEl.appendChild(this.contentEl);

    this.cameraOnBoardView = document.createElement('a-plane');
    this.cameraOnBoardView.setAttribute('position', { x: 0, y: 0.13, z: 0.015 });
    this.cameraOnBoardView.setAttribute('width', '2.2');
    this.cameraOnBoardView.setAttribute('height', '2.4');
    this.cameraOnBoardView.setAttribute('scale', '0 0 0');
    this.cameraOnBoardView.setAttribute('material', {
      src: '#cameraOnBoard',
      shader: 'flat'
    });
    this.cameraOnBoardView.setAttribute('canvas-updater','');
    this.onBoardViewExpanded = false;
    this.hudEl.appendChild(this.cameraOnBoardView);

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

    // Registrar el evento 'mostrar un marcador en el objeto con el puntero encima'.
    this.sceneEl.addEventListener('hud-object-enter', (event) => {
      this.objectEnter(event.detail);
    });

    // Registrar el evento 'borrar un marcador en el con el puntero encima'.
    this.sceneEl.addEventListener('hud-object-leave', (event) => {
      this.objectLeave(event.detail);
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
  },
  /**
   * Función que crea una entidad anillo para señalar el objeto seleccionado
   * en el que se muestra la información en el hud.
   */
  createTriangle: function () {
    this.triangle = document.createElement('a-entity');
    this.triangle.setAttribute('geometry', { primitive: 'cone', radiusBottom: 0, radiusTop: 0.5, height: 1.5, segmentsRadial: 3, segmentsHeight: 1 });
    this.triangle.setAttribute('material', { color: 'green', shader: 'flat' });
    this.triangle.setAttribute('position', '0 40 0'); // posicion relativa
    this.triangle.setAttribute('scale', '20 20 1');
    this.triangle.setAttribute('rotation', '0 -180 0');
    this.triangle.setAttribute('look-at', '#camera');
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
  },
  /**
   * Evento para señalar el elemento data con una geometría que indique que está el ratón encima.
   * @param {HTMLElement} data elemento que vamos a señalar con una geometría.
   */
  objectEnter: function (data) {
    //Comprobamos que está habilitado el hud.
    if (this.disable) return;
    this.createTriangle();
    data.appendChild(this.triangle);
  },
  /**
   * Evento para quitar el marcador del elemento que teníamos el ratón encima.
   * @param {HTMLElement} data elemento del que vamos a quitar el marcador.
   */
  objectLeave: function (data) {
    //Comprobamos que está habilitado el hud.
    if (this.disable) return;
    data.removeChild(this.triangle);
  }
  ,
  disableHud: function () {
    if (this.showed) {
      this.hideData();
    }
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
    if (!this.hudEl.object3D.visible) {
      this.hudEl.object3D.position.copy(this.enableHudPosition);
    }
    this.hudEl.setAttribute('visible', 'true');
    this.showed = true;
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
    this.showed = false;
  },
  createHudButton: function (id,width, height, texSize, position, toogle, toogleCondition , enableFunction, disableFunction, enableColor, disableColor, enableText, disableText) {
    // Creamos el botón de animación como un a-box
    let hudButton = document.createElement('a-box');
    let finalTextSize = texSize != null && texSize != undefined ? texSize : 0.2;
    hudButton.setAttribute('id', id);
    hudButton.setAttribute('width', width);
    hudButton.setAttribute('height', height);
    hudButton.setAttribute('depth', 0.05);
    hudButton.setAttribute('color', toogle ? disableColor:enableColor);
    hudButton.setAttribute('opacity', '0.8');
    hudButton.setAttribute('position', position);
    hudButton.setAttribute('class', "clickable");
    hudButton.addEventListener('mousedown', event => event.stopPropagation());
    hudButton.addEventListener('mouseup', event => event.stopPropagation());
    hudButton.appendChild(this.createTextElement('texId', toogle ? disableText : enableText, finalTextSize));
    hudButton.addEventListener('mouseenter', () => {
      hudButton.setAttribute('material', 'color', 'orange');
    });
    hudButton.addEventListener('mouseleave', () => hudButton.setAttribute('material', 'color', this.enable ? enableColor : disableColor));
    this.enable = false;
    if (toogle) {
      hudButton.addEventListener('click', () => {
        if(!toogleCondition()){
          return;
        }
        this.enable = !this.enable;
        hudButton.removeChild(hudButton.querySelector('#' + 'texId'));
        if (this.enable) {
          hudButton.appendChild(this.createTextElement('texId', enableText, finalTextSize));
          hudButton.setAttribute('color', enableColor);
          hudButton.setAttribute('depth', 0.01);
          enableFunction();
        } else {
          hudButton.appendChild(this.createTextElement('texId', disableText, finalTextSize));
          hudButton.setAttribute('color', disableColor);
          hudButton.setAttribute('depth', 0.05);
          disableFunction();
        }
      });
    } else {
      hudButton.addEventListener('click', () => enableFunction());
    }

    return hudButton;
  },
  createTextElement: function (id, simbol, scale) {
      // Creamos el elemento de texto
      var buttonText = document.createElement('a-text');
      buttonText.setAttribute('value', simbol);
      buttonText.setAttribute('id', id);
      buttonText.setAttribute('align', 'center');
      buttonText.setAttribute('color', '#fff');
      buttonText.setAttribute('scale', { x: scale, y: scale, z: scale });
      buttonText.setAttribute('position', '0 0 0.025');
      return buttonText;
  },
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
  cameraOnBoard: function () {
    if (this.objSelected == undefined || this.objSelected == null) return;

    //Creamos una nueva cámara.
    this.cameraOnBoardEntity = document.createElement('a-entity');
    this.cameraOnBoardEntity.setAttribute('id', 'cameraOnBoarEntity');
    this.cameraOnBoardEntity.setAttribute('camera', 'active: false');
    this.cameraOnBoardEntity.setAttribute('camrender', 'cid:cameraOnBoard;fps:25');
    this.cameraOnBoardEntity.setAttribute('position', '0 0 0');
    this.cameraOnBoardEntity.setAttribute('rotation', '-16 -180 0');

    this.objSelected.appendChild(this.cameraOnBoardEntity);
    this.animateOnBoardView();
  },
  exitCameraOnBoard: function () {
    if (this.objSelected == undefined || this.objSelected == null) return;
        this.animateOnBoardView();
    this.cameraOnBoardEntity.remove();
  },
  animateOnBoardView: function () {
    // Calculamos la escala inicial y final de la entidad rectangular
    this.onBoardViewExpanded = !this.onBoardViewExpanded;
    var startViewScale = this.cameraOnBoardView.getAttribute('scale');
    var endViewScale = this.onBoardViewExpanded ? '0.6 0.6 1' : '0 0 0';

    // Creamos la animación del toolbar
    this.cameraOnBoardView.setAttribute('animation', {
      delay: 100,
      property: 'scale',
      from: startViewScale.x + ' ' + startViewScale.y + ' ' + startViewScale.z,
      to: endViewScale,
      dur: 500,
      easing: 'linear'
    });
  }
});



