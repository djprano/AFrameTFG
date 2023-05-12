AFRAME.registerComponent('tooltip-info', {
    schema: {
        info: { type: 'string', default: '' }
    },
    init: function () {
        // Recuperamos el elemento escena.
        this.sceneEl = document.querySelector("a-scene");

        // Agregamos eventos para cuando se entra y se sale de la entidad.
        this.el.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        this.el.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        //Escuchamos los eventos para habilitar o dehabilitar el info.
        this.enabled = false;
        this.sceneEl.addEventListener('tooltip-info-disable', () => this.enabled = false);
        this.sceneEl.addEventListener('tooltip-info-enable', () => this.enabled = true);


        // Inicializamos la posición del texto
        const box = new THREE.Box3().setFromObject(this.el.object3D);
        let highestPoint = box.max.y + 0.5;
        const position = new THREE.Vector3();
        box.getCenter(position);
        position.y = highestPoint;

        // Mostramos el texto con la información del tooltip
        this.textEl = document.createElement('a-text');
        this.textEl.setAttribute('visible', false);
        this.textEl.setAttribute('value', this.data.info);
        this.textEl.setAttribute('position', position);
        this.textEl.setAttribute('height', 4);
        this.textEl.setAttribute('width', 4);
        this.textEl.setAttribute('align', 'center');
        this.textEl.setAttribute('color', 'white');
        this.textEl.setAttribute('look-at', '#camera');
        this.el.appendChild(this.textEl);
    },
    onMouseEnter: function () {
        if(!this.enabled)return;
        // Guardar el color original
        this.originalColor = this.el.getAttribute("material").color;

        // Cambiar el color a uno de selección
        this.el.setAttribute("material", { color: '#ff6347' });
        this.textEl.setAttribute('visible', true);

    },
    onMouseLeave: function () {
        if(!this.enabled)return;
        // Restauramos el material original y ocultamos el texto
        // Devolver el color original
        this.el.setAttribute("material", { color: this.originalColor });
        this.textEl.setAttribute('visible', false);
    }
});
