import { state, elements } from './shared-state.js';
import { initSearchBar } from './map-search.js';
import { initNavigationControls } from './map-navigation.js';
import { initMapTools, displayAreaOnShape, updateDistanceLine } from './map-tools.js';

export function initMap() {
  const mapElement = document.getElementById("map");
  
  if (!mapElement || !window.azureMapsSubscriptionKey) {
    console.error("Map element or subscription key not found");
    return;
  }

  console.log('Initializing map with subscription key');

  state.map = new atlas.Map('map', {
    center: [78.9629, 20.5937],
    zoom: 4,
    style: 'road',
    view: 'Auto',
    language: 'en-US',
    showFeedbackLink: false,
    showLogo: false,
    bearing: 0,  // Start at north
    pitch: 0,    // Flat view
    dragRotateInteraction: false,  // Disable rotation initially
    touchRotateInteraction: false,  // Disable touch rotation
    authOptions: {
      authType: 'subscriptionKey',
      subscriptionKey: window.azureMapsSubscriptionKey
    }
  });

  state.map.events.add('ready', function() {
    console.log('Map is ready!');
    
    // Add scale bar
    state.map.controls.add(new atlas.control.ScaleControl({
      maxBarLength: 100,
      units: 'metric'
    }), {
      position: 'bottom-left'
    });
    
    // Initialize drawing manager
    state.drawingManager = new atlas.drawing.DrawingManager(state.map, {
      toolbar: new atlas.control.DrawingToolbar({
        buttons: [],
        position: 'top-right',
        style: 'light',
        visible: false
      }),
      freehandInterval: 3,
      snapDistance: 15,
      shapeDraggingOptions: {
        visible: true
      }
    });

    // Setup event listeners
    setupMapEvents();
    
    // Initialize all controls
    initSearchBar();
    initNavigationControls();
    initMapTools();
  });
  
  state.map.events.add('error', function(e) {
    console.error('Map error:', e);
  });
}

function setupMapEvents() {
  // Shape completion
  state.map.events.add('drawingcomplete', state.drawingManager, function(shape) {
    if (state.activeShape) {
      state.drawingManager.getSource().remove(state.activeShape);
    }
    if (state.areaLabel) {
      state.map.markers.remove(state.areaLabel);
    }

    state.activeShape = shape;
    displayAreaOnShape(shape);
    
    state.drawingManager.setOptions({ mode: 'idle' });
  });

  // Shape editing
  state.map.events.add('drawingchanged', state.drawingManager, function(shape) {
    if (shape === state.activeShape) {
      displayAreaOnShape(shape);
    }
  });

  // Context menu
  if (elements.contextMenu) {
    state.map.events.add('contextmenu', function(e) {
      e.preventDefault();
      state.contextLatLng = e.position;

      const pixel = state.map.positionsToPixels([e.position])[0];
      elements.contextMenu.style.left = pixel[0] + 'px';
      elements.contextMenu.style.top = pixel[1] + 'px';
      elements.contextMenu.style.display = 'block';
    });

    state.map.events.add('click', function(e) {
      if (elements.contextMenu.style.display === 'block') {
        elements.contextMenu.style.display = 'none';
      }

      if (state.measuringDistance && e.position) {
        state.contextLatLng = e.position;
        state.distancePath.push(e.position);
        updateDistanceLine();
      }
    });

    document.addEventListener('click', (e) => {
      const mapElement = document.getElementById("map");
      if (!elements.contextMenu.contains(e.target) && !mapElement.contains(e.target)) {
        elements.contextMenu.style.display = 'none';
      }
    });
  }
}