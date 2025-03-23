# LHL Hiking Map

A web application for visualizing hiking routes in Hong Kong with interactive map features.

## Features

- Interactive map displaying hiking routes
- Toggle between 2D and 3D map views
- Filter tracks by various criteria (current year, all tracks)
- View track statistics including total distance and yearly goal progress
- Show heatmap of hiking activity
- Mobile-responsive design
- Track download functionality

## Technologies Used

- [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js) - For 2D and 3D map rendering
- [Turf.js](https://turfjs.org/) - For geospatial analysis
- [jQuery](https://jquery.com/) - For DOM manipulation
- [Moment.js](https://momentjs.com/) - For date formatting

## Project Structure

- `index.html` - Main application entry point
- `css/modern.css` - Styling for the application
- `js/config.js` - Configuration settings
- `js/app.js` - Core application logic
- `js/map-utils.js` - Map utility functions
- `geojson/` - Directory containing route data in GeoJSON format
- `lhl-logo.svg` - Custom SVG logo

## Setup and Usage

1. Clone the repository
2. Open `index.html` in a web browser

The application will load all available hiking tracks and display them on the map. You can:

- Click on any track in the sidebar to view it on the map
- Use the "3D Mode" button to toggle between 2D and 3D views
- Use the "Map Layers" dropdown to control which tracks are displayed
- Click the download button on any track to access its GeoJSON data

## Configuration

Edit the `js/config.js` file to modify:

- Number of routes to display
- Yearly hiking goal
- Mapbox API settings
- UI preferences
- Map styles

## License

This project is personal and not licensed for public use without permission.