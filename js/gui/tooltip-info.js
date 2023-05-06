AFRAME.registerComponent('tooltip-info', {
    schema: {
        info: { type: 'string', default: '' }
    },
    init: function () {
        // Agregamos eventos para cuando se entra y se sale de la entidad.
        this.el.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        this.el.addEventListener('mouseleave', this.onMouseLeave.bind(this));

        // Inicializamos la posición del texto
        const box = new THREE.Box3().setFromObject(this.el.object3D);
        let highestPoint = box.max.y+0.5;
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
        // Guardar el color original
        this.originalColor = this.el.getAttribute("material").color;

        // Cambiar el color a uno de selección
        this.el.setAttribute("material", { color: '#ff6347' });
        this.textEl.setAttribute('visible', true);

    },
    onMouseLeave: function () {
        // Restauramos el material original y ocultamos el texto
        // Devolver el color original
        this.el.setAttribute("material", { color: this.originalColor });
        this.textEl.setAttribute('visible', false);
    }
});
