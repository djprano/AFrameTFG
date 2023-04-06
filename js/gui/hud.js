const HUD_SHOW_JSON = 'hud-show-json';
const HUD_OBJECT_SELECTED = 'hud-object-selected';

AFRAME.registerComponent('hud', {
  init: function () {
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
    // Creamos el texto del botón close.
    var textEl = document.createElement('a-entity');
    textEl.setAttribute('text', {
      value: 'Close',
      align: 'center',
      width: 1.5,
      color: '#FFFFFF',
    });
    textEl.setAttribute('position', '0 0 0.001');
    textEl.setAttribute('raycaster-ignore', true);
    //Creamos el botón
    var closeButtonEl = document.createElement('a-entity');
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
    closeButtonEl.appendChild(textEl);
    closeButtonEl.setAttribute('position', '0 -0.6 0');
    closeButtonEl.setAttribute('rotation', '0 0 0');
    closeButtonEl.addEventListener('click', () => this.hideData());
    closeButtonEl.setAttribute('raycaster-ignore', false);
    closeButtonEl.setAttribute('class', 'clickable'); // Agrega la clase 'clickable'

    this.hudEl.appendChild(closeButtonEl);

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

  },
  objectSelected: function(data){
    const ring = document.createElement('a-entity');
    ring.setAttribute('geometry', { primitive: 'ring', radiusInner: 1, radiusOuter: 1.2 });
    ring.setAttribute('material', { color: 'red', shader: 'flat' });
    ring.setAttribute('position', '0 15 0'); // posicion relativa
    ring.setAttribute('scale', '20 20 1');
    ring.setAttribute('rotation', '0 -180 0');
    ring.setAttribute('look-at','#camera');
    data.appendChild(ring);
  }
  ,
  showData: function (data) {
    // Vaciar el contenido anterior del HUD.
    this.contentEl.innerHTML = '';

    // Añadir el contenido recibido del evento al HUD.
    this.contentEl.appendChild(data);

    // Mostrar el HUD.
    this.hudEl.setAttribute('visible', 'true');
  },
  hideData() {
    // Vaciar el contenido del HUD.
    this.contentEl.innerHTML = '';

    // Ocultar el HUD.
    this.hudEl.setAttribute('visible', 'false');
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
  }
});
