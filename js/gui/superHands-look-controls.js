AFRAME.registerComponent('super-hands-look-controls', {
    init: function () {

        this.cam = document.querySelector('#camera');
        // Configuramos el componente look-controls
        this.cam.setAttribute('look-controls', {
            enabled: true, // Por defecto el componente esta habilitado
            reverseMouseDrag: false
        });
        this.GRAB_EVENT = 'grab-start';
        this.UNGRAB_EVENT = 'grab-end';
        // Registramos los eventos para super-hands
        this.el.addEventListener(this.GRAB_EVENT, this.onGrabStart.bind(this));
        this.el.addEventListener(this.UNGRAB_EVENT, this.onGrabEnd.bind(this));
    },

    onGrabStart: function () {
        // Desactivamos el componente look-controls cuando se empieza a arrastrar
        this.cam.setAttribute('look-controls', { enabled: false });
    },

    onGrabEnd: function () {
        // Activamos el componente look-controls cuando se deja de arrastrar
        this.cam.setAttribute('look-controls', { enabled: true });
    }
});