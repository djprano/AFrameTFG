AFRAME.registerComponent('oculus-logging', {
    init: function () {
        this.el.addEventListener('mouseenter', this.log);
        this.el.addEventListener('raycaster-intersected', this.log);
        this.el.addEventListener('mousedown', this.log);
        this.el.addEventListener('mouseup', this.log);
        this.el.addEventListener('cursormove', this.log);
        this.el.addEventListener('mouseleave', this.log);
        this.el.addEventListener('raycaster-intersection-moving', this.log);
        this.el.addEventListener('raycaster-intersection-threshold', this.log);
        this.el.sceneEl.addEventListener('mousemove', this.log);
        this.el.sceneEl.querySelector('#right-hand').addEventListener('thumbstickmoved', this.log);
    },
    log: function (evt) {
        console.log('Evento:', evt.type);
    }
});

AFRAME.registerComponent('thumbstick-logging',{
    init: function () {
      this.el.addEventListener('thumbstickmoved', this.logThumbstick);
    },
    logThumbstick: function (evt) {
      if (evt.detail.y > 0.95) { console.log("DOWN"); }
      if (evt.detail.y < -0.95) { console.log("UP"); }
      if (evt.detail.x < -0.95) { console.log("LEFT"); }
      if (evt.detail.x > 0.95) { console.log("RIGHT"); }
    }
  });