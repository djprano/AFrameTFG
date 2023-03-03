      AFRAME.registerComponent('toolbar', {
        init: function() {
          // Crea el contenedor de la toolbar
          const toolbar = document.createElement('div');
          toolbar.setAttribute('id', 'toolbar');
          toolbar.style.position = 'absolute';
          toolbar.style.top = '10px';
          toolbar.style.left = '10px';
          toolbar.style.zIndex = '999';

          // Crea los botones
          const button1 = document.createElement('button');
          button1.innerText = 'Botón 1';
          button1.addEventListener('click', function() {
            // Lógica del botón 1
            console.log('Haz clic en el botón 1');
          });

          const button2 = document.createElement('button');
          button2.innerText = 'Botón 2';
          button2.addEventListener('click', function() {
            // Lógica del botón 2
            console.log('Haz clic en el botón 2');
          });

          const toggleButton = document.createElement('button');
          toggleButton.innerText = 'Toggle';
          toggleButton.addEventListener('click', function() {
            // Lógica del toogle button
            console.log('Haz clic en el toogle button');
          });

          // Agrega los botones al contenedor
          toolbar.appendChild(button1);
          toolbar.appendChild(button2);
          toolbar.appendChild(toggleButton);

          // Agrega el contenedor al cuerpo del documento
          document.body.appendChild(toolbar);
        }
      });