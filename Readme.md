# Readme

# Conversión y obtención de datos de edificios en GeoJSon
## Se obtienen los datos con postman con la siguiente petición GET

https://overpass-api.de/api/interpreter?data=(way[building](40.178873,-4.702148,40.971604,-2.900391);relation[building](40.178873,-4.702148,40.971604,-2.900391););out;>;out skel qt;

## Se convierten los datos del formato osm a geojson con la librería osmtogejson

osmtogeojson ..\..\data\buildings.xml > ..\..\data\buildings.json