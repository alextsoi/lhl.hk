/**
 * Configuration file for the LHL Hiking Map application
 */

const CONFIG = {
  // Routes data
  routes: {
    numberOfRoutes: 114,
    extraRoutes: [51, 55, 66],
    yearlyGoal: 500
  },
  
  // Mapbox configuration
  mapbox: {
    accessToken: "pk.eyJ1IjoieWZ0c29peWZ0c29pIiwiYSI6ImNqcnAweTdsbTE5OG40NHA5b2VvaW05Y3UifQ.W_WnayZjcP21QE4h-eFYYQ",
    defaultStyle: 'styleFlat',
    styles: {
      styleFlat: {
        container: "map",
        otherStyleId: 'style3d',
        otherStyle: '3D Mode',
        style: "mapbox://styles/yftsoiyftsoi/ckuz0riu70dnu14lr9gcnmw5i",
        zoom: 10.5,
        center: [114.1535941, 22.3700556],
      },
      style3d: {
        container: "map",
        otherStyleId: 'styleFlat',
        otherStyle: 'Flat Mode',
        style: 'mapbox://styles/yftsoiyftsoi/ckj1e03xy9j9a19sz6zrmkdz5',
        pitch: 55,
        bearing: -10,
        zoom: 11.5,
        center: [114.1535941, 22.3700556],
      }
    },
    colors: {
      styleFlat: {
        default: '#ee6c4d',
        selected: '#3d5a80'
      },
      style3d: {
        default: '#ef476f',
        selected: '#073b4c'
      }
    }
  },
  
  // UI configuration
  ui: {
    mobileBreakpoint: 768,
    dateFormat: 'YYYY-MM-DD',
    trackWidthDefault: 2,
    trackWidthSelected: 3,
    mapPadding: 40,
    terrainExaggeration: 2
  }
};

// Export CONFIG for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} 