AFRAME.registerComponent('hud', {
  init: function () {
    // Crear el elemento del HUD y añadirlo a la escena.
    this.hudEl = document.createElement('a-entity');
    this.hudEl.setAttribute('id', 'hud');
    this.hudEl.setAttribute('position', '0 0 -1');
    this.hudEl.setAttribute('visible', 'false');


    // Crear un fondo transparente para el HUD.
    var backgroundEl = document.createElement('a-plane');
    backgroundEl.setAttribute('color', '#000');
    backgroundEl.setAttribute('opacity', '0.5');
    backgroundEl.setAttribute('width', '2');
    backgroundEl.setAttribute('height', '1.5');
    backgroundEl.setAttribute('raycaster-ignore', true);
    this.hudEl.appendChild(backgroundEl);

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
    this.hudEl.addEventListener('hud-show-json', (event) => {
      this.showData(this.json2TextComponent(event.detail));
    });

    // Registrar el evento 'ocultar' para ocultar el HUD.
    this.hudEl.addEventListener('hud-hide', () => {
      // Vaciar el contenido del HUD.
      this.contentEl.innerHTML = '';

      // Ocultar el HUD.
      this.hudEl.setAttribute('visible', 'false');
    });
  },
  showData: function (data) {
    // Vaciar el contenido anterior del HUD.
    this.contentEl.innerHTML = '';

    // Añadir el contenido recibido del evento al HUD.
    this.contentEl.appendChild(data);

    // Mostrar el HUD.
    this.hudEl.setAttribute('visible', 'true');
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
      textEl.setAttribute('position', '0 ' + (-0.2 * Object.keys(jsonData).indexOf(propiedad)) + ' 0');
      textEl.setAttribute('height', 5);
      textEl.setAttribute('width', 5);
      textEl.setAttribute('align', 'left');
      textEl.setAttribute('color', 'white');
      textEl.setAttribute('width', '3');
      jsonEl.appendChild(textEl);
    }
    return jsonEl;
  }
});
