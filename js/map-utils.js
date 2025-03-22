/**
 * Map Utilities - Performance optimizations for hiking map
 */

const MapUtils = {
  /**
   * Optimizes GeoJSON data by reducing the number of points
   * @param {Object} geoJson - The GeoJSON data
   * @param {Number} tolerance - The simplification tolerance (higher = fewer points)
   * @returns {Object} Simplified GeoJSON
   */
  simplifyGeoJson: function(geoJson, tolerance = 0.0001) {
    if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
      return geoJson;
    }

    try {
      const feature = geoJson.features[0];
      
      if (feature.geometry.type === 'LineString') {
        const simplified = turf.simplify(feature, {
          tolerance: tolerance,
          highQuality: true
        });
        
        geoJson.features[0] = simplified;
      } else if (feature.geometry.type === 'MultiLineString') {
        // For each line in the MultiLineString
        feature.geometry.coordinates = feature.geometry.coordinates.map(line => {
          const lineFeature = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: line
            }
          };
          
          const simplified = turf.simplify(lineFeature, {
            tolerance: tolerance,
            highQuality: true
          });
          
          return simplified.geometry.coordinates;
        });
      }
      
      return geoJson;
    } catch (e) {
      console.error('Error simplifying GeoJSON:', e);
      return geoJson;
    }
  },
  
  /**
   * Calculates statistics for all loaded tracks
   * @param {Object} mapData - The map data object
   * @param {Number} yearlyGoal - The yearly goal in km
   * @returns {Object} Statistics object
   */
  calculateStats: function(mapData, yearlyGoal) {
    const keys = Object.keys(mapData);
    let total = 0;
    let yearlyTotal = 0;
    const currentYear = new Date().getFullYear();
    const monthlyStats = Array(12).fill(0);
    
    keys.forEach(key => {
      const length = parseFloat(mapData[key].length);
      total += length;
      
      const trackDate = new Date(mapData[key].time);
      const trackYear = trackDate.getFullYear();
      const trackMonth = trackDate.getMonth();
      
      if (trackYear === currentYear) {
        yearlyTotal += length;
        monthlyStats[trackMonth] += length;
      }
    });
    
    return {
      total: total.toFixed(2),
      yearly: yearlyTotal.toFixed(2),
      yearlyGoal,
      progress: Math.min(100, (yearlyTotal / yearlyGoal) * 100),
      monthlyStats
    };
  },
  
  /**
   * Creates a color gradient between two colors
   * @param {String} startColor - Starting hex color
   * @param {String} endColor - Ending hex color
   * @param {Number} steps - Number of steps in gradient
   * @returns {Array} Array of hex colors
   */
  createColorGradient: function(startColor, endColor, steps) {
    // Convert hex to RGB
    const hexToRgb = hex => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    // Convert RGB to hex
    const rgbToHex = ({r, g, b}) => {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    };
    
    const start = hexToRgb(startColor);
    const end = hexToRgb(endColor);
    const colors = [];
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const r = Math.round(start.r + ratio * (end.r - start.r));
      const g = Math.round(start.g + ratio * (end.g - start.g));
      const b = Math.round(start.b + ratio * (end.b - start.b));
      colors.push(rgbToHex({r, g, b}));
    }
    
    return colors;
  },
  
  /**
   * Adds a color-coded elevation profile to the map
   * @param {Object} map - Mapbox GL map instance
   * @param {Object} geoJson - The GeoJSON data
   * @param {String} layerId - Layer ID to use
   */
  addElevationProfile: function(map, geoJson, layerId) {
    if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
      return;
    }
    
    try {
      const feature = geoJson.features[0];
      const coordinates = feature.geometry.type === 'LineString' ? 
        feature.geometry.coordinates : 
        feature.geometry.coordinates.flat();
      
      // Extract elevations
      const elevations = coordinates.map(coord => coord[2] || 0);
      const minElevation = Math.min(...elevations);
      const maxElevation = Math.max(...elevations);
      const elevationRange = maxElevation - minElevation;
      
      // Create color gradient from low to high elevation
      const colors = this.createColorGradient('#2a9d8f', '#e76f51', 10);
      
      // Create stops for gradient
      const stops = [];
      for (let i = 0; i < 10; i++) {
        stops.push([minElevation + (i / 9) * elevationRange, colors[i]]);
      }
      
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      
      if (map.getSource(layerId + '-source')) {
        map.removeSource(layerId + '-source');
      }
      
      map.addSource(layerId + '-source', {
        'type': 'geojson',
        'data': geoJson
      });
      
      map.addLayer({
        'id': layerId,
        'type': 'line',
        'source': layerId + '-source',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': [
            'interpolate',
            ['linear'],
            ['get', 'ele'],
            ...stops.flat()
          ],
          'line-width': 4
        }
      });
    } catch (e) {
      console.error('Error adding elevation profile:', e);
    }
  },
  
  /**
   * Creates a heatmap of track density
   * @param {Object} map - Mapbox GL map instance
   * @param {Array} tracksData - Array of all track data
   */
  createTrackHeatmap: function(map, tracksData) {
    // Combine all tracks into a single set of points
    const points = {
      type: 'FeatureCollection',
      features: []
    };
    
    tracksData.forEach(track => {
      if (!track || !track.data || !track.data.features || track.data.features.length === 0) {
        return;
      }
      
      const feature = track.data.features[0];
      const coordinates = feature.geometry.type === 'LineString' ? 
        feature.geometry.coordinates : 
        feature.geometry.coordinates.flat();
      
      // Sample every 10th point to reduce density
      for (let i = 0; i < coordinates.length; i += 10) {
        points.features.push({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [coordinates[i][0], coordinates[i][1]]
          }
        });
      }
    });
    
    if (map.getLayer('heatmap-layer')) {
      map.removeLayer('heatmap-layer');
    }
    
    if (map.getSource('heatmap-source')) {
      map.removeSource('heatmap-source');
    }
    
    map.addSource('heatmap-source', {
      type: 'geojson',
      data: points
    });
    
    map.addLayer({
      id: 'heatmap-layer',
      type: 'heatmap',
      source: 'heatmap-source',
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0, 0, 255, 0)',
          0.2, 'rgba(0, 255, 255, 0.2)',
          0.4, 'rgba(0, 255, 0, 0.4)',
          0.6, 'rgba(255, 255, 0, 0.6)',
          0.8, 'rgba(255, 0, 0, 0.8)',
          1, 'rgba(255, 0, 0, 1)'
        ],
        'heatmap-radius': 10,
        'heatmap-opacity': 0.7
      }
    });
  }
};

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapUtils;
} 