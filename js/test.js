var terrain;
var mainScene;


AFRAME.registerComponent('handle-events', {
    init: function () {
        var el = this.el;  // <a-box>
        let scale = 1.5;
        let unscale = 1 / scale;
        el.addEventListener('mouseenter', function () {
            el.setAttribute('scale', { x: scale, y: scale, z: scale });
        });
        el.addEventListener('mouseleave', function () {
            el.setAttribute('scale', { x: unscale, y: unscale, z: unscale });
        });
        el.addEventListener('click', function(){
            el.parentNode.removeChild(el);
        });
    }
});

AFRAME.registerComponent('main-scene', {
    init: function () {
        mainScene = this.el;
        terrain = mainScene.querySelector('#terrain');
    }
}
);
