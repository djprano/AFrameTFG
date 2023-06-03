AFRAME.registerComponent('toolbar3d', {
    init: function () {
        // Recuperamos el elemento escena.
        this.sceneEl = document.querySelector("a-scene");

        // Creamos la entidad rectangular
        this.toolbar = document.createElement('a-plane');
        this.toolbar.setAttribute('id', 'toolbar3d');
        this.toolbar.setAttribute('look-at', '#camera');
        this.toolbar.setAttribute('class', "clickable");
        this.toolbar.setAttribute('geometry', { primitive: 'box', width: 1, height: 0.2, depth: 0.05 });
        this.toolbar.setAttribute('color', '#000');
        this.toolbar.setAttribute('opacity', '0.4');
        this.toolbar.setAttribute('custom-draggable', '');
        this.toolbar.setAttribute('position', { x: 0, y: -0.7, z: -2 });


        // Establecemos el estado inicial de la entidad rectangular
        this.expanded = true;

        this.xFoldPosition = -0.37;
        // Creamos el botón de animación como un a-box
        this.foldButton = this.createToolbarButton('foldButton',0.15, 0.15, null,0.5,{ x: this.xFoldPosition, y: 0, z: 0.06 },true,
            () => this.animateToolbar(),
            () => this.animateToolbar(),
            '#000', '#000', '>', '<');
        //Agregamos el botón al toolbar.
        this.toolbar.appendChild(this.foldButton);
        //Agregamos el toolbar al elemento.
        this.el.appendChild(this.toolbar);

        //Creamos un botón para habilitar el hud
        this.hudEnableButton = this.createToolbarButton('hudEnableButton',0.3, 0.15, null,null, { x: -0.09, y: 0, z: 0.06 }, true,
             () => this.sceneEl.emit('hud-enable', null),
             () => this.sceneEl.emit('hud-disable', null),
             '#0a0', '#a00', 'Hud enable', 'Hud disable');
        this.toolbar.appendChild(this.hudEnableButton);

        //Creamos un botón para habilitar el info.
        this.infoEnableButton = this.createToolbarButton('infoEnableButton',0.3, 0.15, null,null, { x: 0.29, y: 0, z: 0.06 }, true,
            () => this.sceneEl.emit('tooltip-info-enable', null),
            () => this.sceneEl.emit('tooltip-info-disable', null),
            '#0a0', '#a00', 'Info enable', 'Info disable');
       this.toolbar.appendChild(this.infoEnableButton);

    },
    createToolbarButton: function (id,width, height, text,texSize, position, toogle, enableFunction, disableFunction, enableColor, disableColor, enableText, disableText) {
        // Creamos el botón de animación como un a-box
        let toolBarButton = document.createElement('a-box');
        let finalTextSize = texSize != null && texSize != undefined ? texSize : 0.2;
        toolBarButton.setAttribute('id', id);
        toolBarButton.setAttribute('width', width);
        toolBarButton.setAttribute('height', height);
        toolBarButton.setAttribute('depth', 0.05);
        toolBarButton.setAttribute('color', disableColor);
        toolBarButton.setAttribute('opacity', '0.8');
        toolBarButton.setAttribute('position', position);
        toolBarButton.setAttribute('class', "clickable");
        toolBarButton.addEventListener('mousedown', event => event.stopPropagation());
        toolBarButton.addEventListener('mouseup', event => event.stopPropagation());
        toolBarButton.addEventListener('mouseenter', () => {
            toolBarButton.setAttribute('material', 'color', 'orange');
        });
        toolBarButton.addEventListener('mouseleave', () => toolBarButton.setAttribute('material', 'color', enable ? enableColor:disableColor));
        let enable = false;
        if(toogle){
            toolBarButton.appendChild(this.createTextElement('texId', disableText, finalTextSize));
            toolBarButton.addEventListener('click', () => {
                enable = !enable;
                toolBarButton.removeChild(toolBarButton.querySelector('#'+'texId'));
                if (enable) {
                    toolBarButton.appendChild(this.createTextElement('texId', enableText, finalTextSize));
                    toolBarButton.setAttribute('color', enableColor);
                    toolBarButton.setAttribute('depth', 0.01);
                    enableFunction();
                } else {
                    toolBarButton.appendChild(this.createTextElement('texId', disableText, finalTextSize));
                    toolBarButton.setAttribute('color', disableColor);
                    toolBarButton.setAttribute('depth', 0.05);
                    disableFunction();
                }
            });
        }else{
            toolBarButton.appendChild(this.createTextElement('texId', text, finalTextSize));
        }
        
        return toolBarButton;
    },
    animateToolbar: function () {
        this.expanded = !this.expanded;

        // Calculamos la escala inicial y final de la entidad rectangular
        var startToolbarScale = this.toolbar.getAttribute('scale');
        var endToolbarScale = this.expanded ? '1 1 1' : '0.1 1 1';

        // Creamos la animación del toolbar
        this.toolbar.setAttribute('animation', {
            delay: 100,
            property: 'scale',
            from: startToolbarScale.x + ' ' + startToolbarScale.y + ' ' + startToolbarScale.z,
            to: endToolbarScale,
            dur: 500,
            easing: 'linear'
        });

        // Creamos la animación de la opacidad de la entidad rectangular
        var startOpacity = this.toolbar.getAttribute('opacity');
        var endOpacity = this.expanded ? 0.6 : 0.2;

        this.toolbar.setAttribute('animation__opacity', {
            delay: 100,
            property: 'opacity',
            from: startOpacity,
            to: endOpacity,
            dur: 500,
            easing: 'linear'
        });

        // Calculamos la escala inicial y final de la entidad rectangular
        var startFoldButtonScale = this.toolbar.getAttribute('scale');
        var endFoldButtonScale = this.expanded ? '1 1 1' : '10 1 1';

        // Creamos la animación del botón que anula la deformación.
        this.foldButton.setAttribute('animation', {
            delay: 100,
            property: 'scale',
            from: startFoldButtonScale.x + ' ' + startFoldButtonScale.y + ' ' + startFoldButtonScale.z,
            to: endFoldButtonScale,
            dur: 1000,
            easing: 'linear'
        });

        if(this.expanded){
            this.hudEnableButton.setAttribute('visible', true);
            this.infoEnableButton.setAttribute('visible', true);
        }else{
            this.hudEnableButton.setAttribute('visible', false);
            this.infoEnableButton.setAttribute('visible', false);
        }

    },
    createTextElement: function (id, simbol, scale) {
        // Creamos el elemento de texto
        var buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', simbol);
        buttonText.setAttribute('id', id);
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', '#fff');
        buttonText.setAttribute('scale', { x: scale, y: scale, z: scale });
        buttonText.setAttribute('position', '0 0 0.03');
        return buttonText;
    }
});