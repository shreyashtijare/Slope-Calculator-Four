// Shared variables accessible by all modules
export const state = {
  map: null,
  drawingManager: null,
  activeShape: null,
  areaLabel: null,
  distanceMarkers: [],
  searchMarker: null,
  contextLatLng: null,
  distancePath: [],
  distanceDataSource: null,
  measuringDistance: false,
  currentStyle: 'road',
  labelsVisible: true,
  isChangingStyle: false,
  mapInitialized: false,
  isRotationLocked: true  // NEW: North-lock state
};

// Shared DOM elements
export const elements = {
  sidebar: document.getElementById("sidebar"),
  sidebarToggle: document.getElementById("sidebarToggle"),
  contextMenu: document.getElementById("contextMenu"),
  infoPanel: document.getElementById("infoPanel"),
  panels: document.querySelectorAll(".panel")
};

// Shared utility functions
export function showInfo(html) {
  if (elements.infoPanel) {
    elements.infoPanel.innerHTML = html;
    elements.infoPanel.style.display = "block";
  }
}

export function hideInfo() {
  if (elements.infoPanel) {
    elements.infoPanel.style.display = "none";
  }
}