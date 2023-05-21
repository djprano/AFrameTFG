var geometry = ee.Geometry.Rectangle(3.7545776367187,48.491151723988,4.6238708496094,49.027963936994);

// Convierte la geometría a un objeto Feature y establece un nombre
var rectangulo = ee.Feature(geometry, {nombre: 'Mi rectángulo'});

// Añade el rectángulo a la vista del Mapa
Map.addLayer(rectangulo, {}, 'Rectángulo');

var ColeccionSentinel = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2019-01-01', '2019-02-28');

var Mosaico = ColeccionSentinel.mosaic();
Map.addLayer(Mosaico, {
    max: 5000.0,
    min: 0.0,
    gamma: 1.0,
    bands: ['B4', 'B3', 'B2']
},
    'Composicion RGB');

// Crear una imagen RGB utilizando las bandas B4, B3 y B2
var RGB = Mosaico.visualize({
    bands: ['B4', 'B3', 'B2'],
    max: 5000,
    min: 0,
    gamma: 1.0
});

// Crea un objeto Projection a partir de la identificación EPSG
var epsg3857 = 'EPSG:3857';

// Descargar la imagen RGB en formato GeoTIFF
Export.image.toDrive({
    image: RGB,
    description: 'Sentinel2_RGB',
    scale: 20,
    crs:epsg3857,
    region: geometry,
    maxPixels: 28710052848
});