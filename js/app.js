/**
 * Main application script for LHL Hiking Map
 */

// Global variables
let map;
let mapData = {};
let selectedRoute = null;
let loaded = 0;
let finished = false;
let lastSelectedLayer = null;
let currentStyle = CONFIG.mapbox.defaultStyle;

/**
 * Reduces the number of coordinates in an array by sampling
 * @param {Array} range - Array of coordinates
 * @param {Number} n - Sample every nth coordinate
 * @returns {Array} Reduced array of coordinates
 */
function reduceMarks(range, n) {
  const marks = [];
  for (let i = 0; i < range.length; i += n) {
    marks.push(range[i]);
  }
  return marks;
}

/**
 * Creates HTML template for a track item
 * @param {String} index - Track index 
 * @param {String} name - Track name
 * @param {String} time - Track time
 * @param {String} length - Track length
 * @returns {String} HTML for track item
 */
function createTrackItemTemplate(index, name, time, length) {
  return `
    <li class="track-item" data-index="${index}">
      <div class="track-title">${name}</div>
      <div class="track-meta">
        <span>${moment(time).format(CONFIG.ui.dateFormat)}</span>
        <span>${length} km</span>
        <a href="./geojson/${index}.geojson" class="download-btn" target="_blank" title="Open GeoJSON">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </a>
      </div>
    </li>
  `;
}

/**
 * Updates statistics display
 */
function updateStats() {
  if (!finished) return;

  const keys = Object.keys(mapData).sort((a, b) => b - a);
  
  let total = 0;
  let yearTotal = 0;
  const currentYear = (new Date()).getFullYear();
  
  keys.forEach((key) => {
    total += parseFloat(mapData[key].length);
    const thisYear = parseInt(mapData[key].time.substr(0, 4));
    if (thisYear === currentYear) {
      yearTotal += parseFloat(mapData[key].length);
    }
  });
  
  // Update stats in the UI
  $('#total-distance').text(total.toFixed(2) + ' km');
  $('#yearly-distance').text(yearTotal.toFixed(2) + ' / ' + CONFIG.routes.yearlyGoal + ' km');
  
  // Update progress bar
  const progressPercent = Math.min(100, (yearTotal / CONFIG.routes.yearlyGoal) * 100);
  $('#yearly-progress').css('width', progressPercent + '%');
  
  // Change progress bar color based on completion
  if (progressPercent >= 100) {
    $('#yearly-progress').css('background-color', 'var(--success)');
  } else if (progressPercent >= 75) {
    $('#yearly-progress').css('background-color', 'var(--warning)');
  } else {
    $('#yearly-progress').css('background-color', 'var(--secondary)');
  }
}

/**
 * Sorts and displays tracks in the sidebar
 */
function triggerSorting() {
  if (finished) return;
  loaded++;
  
  const keys = Object.keys(mapData).sort((a, b) => b - a);
  
  $('#map-list-items').html('');
  
  keys.forEach((key) => {
    const trackName = mapData[key].name.replace('**', '');
    const trackTime = mapData[key].time;
    const trackLength = mapData[key].length;
    
    const trackItemHtml = createTrackItemTemplate(key, trackName, trackTime, trackLength);
    $('#map-list-items').append(trackItemHtml);
  });
  
  if (loaded === (CONFIG.routes.numberOfRoutes + CONFIG.routes.extraRoutes.length)) {
    finished = true;
    updateStats();
    $('#loading-overlay').fadeOut(500);
  }
}

/**
 * Adds a track to the map
 * @param {Object} data - GeoJSON data
 * @param {String} index - Track index
 */
function drawAgain(data, index) {
  if (data === null) data = mapData[index].data;
  else {
    mapData[index] = {
      name: '#' + index + ' - ' + data.features[0].properties.name,
      time: moment(data.features[0].properties.time).format('YYYY-MM-DD HH:mm:ss'),
      length: turf.length(data.features[0]).toLocaleString(),
      data: data
    };
  }
  
  map.addSource('route' + index, {
    'type': 'geojson',
    'data': data
  });
  
  map.addLayer({
    'id': 'route' + index,
    'type': 'line',
    'source': 'route' + index,
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': CONFIG.mapbox.colors[currentStyle].default,
      'line-width': CONFIG.ui.trackWidthDefault
    }
  });
  
  triggerSorting();
}

/**
 * Handles map loading and initializes track data
 */
function onLoad() {
  if (currentStyle === 'style3d') {
    map.addSource('mapbox-dem', {
      'type': 'raster-dem',
      'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
      'tileSize': 512,
      'maxzoom': 14
    });
    
    map.setTerrain({
      'source': 'mapbox-dem',
      'exaggeration': CONFIG.ui.terrainExaggeration
    });
  }
  
  for (let i = 1; i <= CONFIG.routes.numberOfRoutes; i++) {
    (function(index) {
      if (CONFIG.routes.extraRoutes.indexOf(index) !== -1) {
        if (typeof mapData[index] !== 'undefined') {
          drawAgain(null, index + '-1');
        } else {
          $.getJSON('./geojson/' + index + '-1.geojson', function(data) {
            drawAgain(data, index + '-1');
          });
        }
      }
      
      if (typeof mapData[index] !== 'undefined') {
        drawAgain(null, index);
      } else {
        $.getJSON('./geojson/' + index + '.geojson', function(data) {
          drawAgain(data, index);
        });
      }
    })(i);
  }
}

/**
 * Refreshes the map style
 */
function refreshStyle() {
  $('#toggle-style').html(`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
      <line x1="12" y1="22" x2="12" y2="15.5"></line>
      <polyline points="22 8.5 12 15.5 2 8.5"></polyline>
    </svg>
    ${CONFIG.mapbox.styles[currentStyle].otherStyle}
  `);
  
  mapboxgl.accessToken = CONFIG.mapbox.accessToken;
  map = new mapboxgl.Map(CONFIG.mapbox.styles[currentStyle]);
  map.on('load', onLoad);
}

/**
 * Adjusts sidebar height to match stats container on mobile
 */
function adjustSidebarHeight() {
  if (window.innerWidth <= CONFIG.ui.mobileBreakpoint) {
    const statsHeight = $('.stats-container').outerHeight();
    if (!$('.sidebar').hasClass('mobile-show')) {
      $('.sidebar').css('height', statsHeight + 'px');
    }
  } else {
    $('.sidebar').css('height', '');
  }
  
  // Adjust map-list-container height to fill available space
  adjustMapListHeight();
}

/**
 * Adjusts map list container height
 */
function adjustMapListHeight() {
  if (window.innerWidth <= CONFIG.ui.mobileBreakpoint && $('.sidebar').hasClass('mobile-show')) {
    const headerHeight = $('.header').outerHeight();
    const statsHeight = $('.stats-container').outerHeight();
    $('.map-list-container').css({
      'top': statsHeight + 'px',
      'height': `calc(100dvh - ${statsHeight}px - ${headerHeight}px)`
    });
  } else if (window.innerWidth > CONFIG.ui.mobileBreakpoint) {
    const sidebarHeight = $('.sidebar').height();
    const statsHeight = $('.stats-container').outerHeight();
    $('.map-list-container').css({
      'top': statsHeight + 'px',
      'height': (sidebarHeight - statsHeight) + 'px'
    });
  } else {
    $('.map-list-container').css({
      'top': $('.stats-container').outerHeight() + 'px',
      'height': '0'
    });
  }
}

// Initialize application when document is ready
$(document).ready(function() {
  // Initialize map
  refreshStyle();
  
  // Track selection
  $('body').on('click', '.track-item', function(e) {
    if ($(e.target).closest('.download-btn').length) {
      // Don't handle click if download button was clicked
      return;
    }
    
    e.preventDefault();
    $('.track-item').removeClass('active');
    
    $(this).addClass('active');
    const index = $(this).data('index');
    
    if (lastSelectedLayer) {
      map.setPaintProperty('route' + lastSelectedLayer, 'line-color', CONFIG.mapbox.colors[currentStyle].default);
      map.setPaintProperty('route' + lastSelectedLayer, 'line-width', CONFIG.ui.trackWidthDefault);
    }
    
    lastSelectedLayer = index;
    
    if (typeof index !== 'undefined' && typeof mapData[index].data !== 'undefined') {
      let coordinates = [];
      
      if (mapData[index].data.features[0].geometry.type === 'LineString') {
        coordinates = mapData[index].data.features[0].geometry.coordinates;
      } else {
        mapData[index].data.features[0].geometry.coordinates.map(function(coord) {
          coordinates = coordinates.concat(coord);
        });
      }
      
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      
      map.fitBounds(bounds, {
        padding: CONFIG.ui.mapPadding
      });
      
      map.setPaintProperty('route' + lastSelectedLayer, 'line-color', CONFIG.mapbox.colors[currentStyle].selected);
      map.setPaintProperty('route' + lastSelectedLayer, 'line-width', CONFIG.ui.trackWidthSelected);
      
      // Close sidebar in mobile view
      if (window.innerWidth <= CONFIG.ui.mobileBreakpoint) {
        $('.sidebar').removeClass('mobile-show');
        $('#mobile-toggle-sidebar').removeClass('mobile-menu-open');
        $('.sidebar').css('height', $('.stats-container').outerHeight() + 'px');
        $('.map-list-container').css({
          'top': $('.stats-container').outerHeight() + 'px',
          'height': '0'
        });
      }
    }
  });
  
  // Toggle map style button
  $('#toggle-style').on('click', function(e) {
    if (!finished) {
      alert('Please wait until all hiking tracks are loaded!');
      return;
    }
    currentStyle = CONFIG.mapbox.styles[currentStyle].otherStyleId;
    refreshStyle();
  });
  
  // Run height adjustments on page load and when window is resized
  adjustSidebarHeight();
  $(window).on('resize', adjustSidebarHeight);
  
  // Mobile sidebar toggle with height adjustment
  $('#mobile-toggle-sidebar').on('click', function() {
    $('.sidebar').toggleClass('mobile-show');
    $(this).toggleClass('mobile-menu-open');
    
    // Immediately adjust height when toggling
    if (window.innerWidth <= CONFIG.ui.mobileBreakpoint) {
      if ($('.sidebar').hasClass('mobile-show')) {
        $('.sidebar').css('height', $('.stats-container').outerHeight() + 'px');
        // Allow some time for the transition before adjusting map list height
        setTimeout(adjustMapListHeight, 50);
      } else {
        $('.sidebar').css('height', $('.stats-container').outerHeight() + 'px');
        $('.map-list-container').css({
          'top': $('.stats-container').outerHeight() + 'px',
          'height': '0'
        });
      }
    }
  });
  
  // Map layers dropdown toggle
  $('#toggle-layers').on('click', function(e) {
    $('#layers-dropdown').toggle();
  });
  
  // Handle layer toggles
  $('#toggle-all-tracks').on('change', function() {
    const visible = $(this).is(':checked');
    for (let i = 1; i <= CONFIG.routes.numberOfRoutes; i++) {
      if (map.getLayer('route' + i)) {
        map.setLayoutProperty('route' + i, 'visibility', visible ? 'visible' : 'none');
      }
      if (map.getLayer('route' + i + '-1')) {
        map.setLayoutProperty('route' + i + '-1', 'visibility', visible ? 'visible' : 'none');
      }
    }
  });
  
  $('#toggle-terrain').on('change', function() {
    const enabled = $(this).is(':checked');
    if (map.getTerrain()) {
      if (enabled) {
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': CONFIG.ui.terrainExaggeration });
      } else {
        map.setTerrain(null);
      }
    } else if (enabled && currentStyle === 'style3d') {
      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': CONFIG.ui.terrainExaggeration });
    }
  });
  
  $('#toggle-current-year').on('change', function() {
    const currentYearOnly = $(this).is(':checked');
    const currentYear = (new Date()).getFullYear();
    
    for (let i = 1; i <= CONFIG.routes.numberOfRoutes; i++) {
      if (map.getLayer('route' + i)) {
        const routeYear = mapData[i] ? parseInt(mapData[i].time.substr(0, 4)) : 0;
        if (currentYearOnly && routeYear !== currentYear) {
          map.setLayoutProperty('route' + i, 'visibility', 'none');
        } else {
          map.setLayoutProperty('route' + i, 'visibility', 'visible');
        }
      }
      
      if (map.getLayer('route' + i + '-1')) {
        const routeYearExt = mapData[i + '-1'] ? parseInt(mapData[i + '-1'].time.substr(0, 4)) : 0;
        if (currentYearOnly && routeYearExt !== currentYear) {
          map.setLayoutProperty('route' + i + '-1', 'visibility', 'none');
        } else {
          map.setLayoutProperty('route' + i + '-1', 'visibility', 'visible');
        }
      }
    }
  });
  
  $('#toggle-heatmap').on('change', function() {
    const enabled = $(this).is(':checked');
    if (enabled) {
      // Create heatmap using the MapUtils function
      if (finished) {
        const allTracks = [];
        const keys = Object.keys(mapData);
        
        keys.forEach(function(key) {
          if (mapData[key] && mapData[key].data) {
            allTracks.push(mapData[key]);
          }
        });
        
        MapUtils.createTrackHeatmap(map, allTracks);
      } else {
        alert('Please wait until all hiking tracks are loaded!');
        $(this).prop('checked', false);
      }
    } else {
      // Remove heatmap
      if (map.getLayer('heatmap-layer')) {
        map.removeLayer('heatmap-layer');
      }
      
      if (map.getSource('heatmap-source')) {
        map.removeSource('heatmap-source');
      }
    }
  });
}); 