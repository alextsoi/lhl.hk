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

# Hong Kong Hiking Map

An interactive web application for visualizing hiking tracks in Hong Kong.

## Features

- Interactive map with 2D and 3D views of hiking trails
- Track list with sorting by date
- Statistics dashboard showing total distance hiked and yearly progress
- Map layer controls (show/hide tracks, terrain, filter by year)
- Mobile-responsive design

## Technology Stack

- Mapbox GL JS for map visualization
- jQuery for DOM manipulation
- Turf.js for geospatial calculations
- Moment.js for date formatting

## How to Use

1. Open `index-modern.html` in a web browser
2. Browse the list of hiking tracks on the left sidebar
3. Click on a track to view it on the map
4. Use the control buttons in the top-right corner to:
   - Toggle between 2D and 3D views
   - Manage map layers (show all tracks, show terrain, filter by current year)

## Data Structure

The application uses GeoJSON files stored in the `geojson/` directory. Each track is stored as a separate file with the naming convention `[track_number].geojson`.

## License

This project is for personal use.

## Author

Alex Lau