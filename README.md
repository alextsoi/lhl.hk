node 14.13.0

# Command
togeojson maps/xxx > geojson/xxx

# Reference
https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb
https://github.com/mapbox/martini
https://blog.mapbox.com/taking-our-maps-to-the-next-dimension-dbeee37a7c4c
https://observablehq.com/@mourner/martin-real-time-rtin-terrain-mesh

9/418/223
9.5/591/315
10/836/446
11/1673/893

114.109497
22.396427

function lon2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }


https://api.mapbox.com/v4/mapbox.terrain-rgb/9/418/223@2x.pngraw?access_token=pk.eyJ1IjoieWZ0c29peWZ0c29pIiwiYSI6ImNqcnAweTdsbTE5OG40NHA5b2VvaW05Y3UifQ.W_WnayZjcP21QE4h-eFYYQ