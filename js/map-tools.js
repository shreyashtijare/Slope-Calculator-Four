import { state, elements, showInfo, hideInfo } from './shared-state.js';

export function initMapTools() {
  initStyleToggle();
  initLabelToggle();
  initClearButton();
  initContextMenu();
}

// Calculate polygon area
function calculatePolygonArea(coordinates) {
  if (coordinates.length < 3) return 0;
  
  let area = 0;
  const numPoints = coordinates.length;
  
  for (let i = 0; i < numPoints - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    area += (p1[0] * p2[1]) - (p2[0] * p1[1]);
  }
  
  const p1 = coordinates[numPoints - 1];
  const p2 = coordinates[0];
  area += (p1[0] * p2[1]) - (p2[0] * p1[1]);
  
  area = Math.abs(area) / 2;
  
  const metersPerDegreeLat = 111320;
  const avgLat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
  const metersPerDegreeLon = metersPerDegreeLat * Math.cos(avgLat * Math.PI / 180);
  
  area = area * metersPerDegreeLat * metersPerDegreeLon;
  
  return area;
}

// Display area label
export function displayAreaOnShape(shape) {
  if (!shape) return;
  
  if (state.areaLabel) {
    state.map.markers.remove(state.areaLabel);
  }
  
  const geometry = shape.toJson().geometry;
  let area = 0;
  let center = null;
  
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates[0];
    area = calculatePolygonArea(coords);
    
    let sumLng = 0, sumLat = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      sumLng += coords[i][0];
      sumLat += coords[i][1];
    }
    center = [sumLng / (coords.length - 1), sumLat / (coords.length - 1)];
  }
  
  if (center && area > 0) {
    const areaM2 = area.toFixed(2);
    const areaSqFt = (area * 10.7639).toFixed(2);
    const areaHa = (area / 10000).toFixed(4);
    const areaAcres = (area * 0.000247105).toFixed(4);
    
    const htmlContent = `
      <div style="
        background: rgba(255, 255, 255, 0.95);
        padding: 10px 14px;
        border-radius: 8px;
        box-shadow: 0 3px 12px rgba(0,0,0,0.4);
        font-family: system-ui, Arial, sans-serif;
        font-size: 12px;
        font-weight: 600;
        color: #333;
        text-align: center;
        white-space: nowrap;
        border: 2px solid #007bff;
        pointer-events: none;
      ">
        <div style="font-size: 14px; color: #007bff; margin-bottom: 4px;">📐 Area</div>
        <div style="margin: 2px 0;">${areaM2} m² / ${areaSqFt} ft²</div>
        <div style="font-size: 10px; color: #666; margin-top: 4px;">${areaHa} ha | ${areaAcres} acres</div>
      </div>
    `;
    
    state.areaLabel = new atlas.HtmlMarker({
      position: center,
      htmlContent: htmlContent,
      pixelOffset: [0, 0]
    });
    
    state.map.markers.add(state.areaLabel);
  }
}

// Update distance line
export function updateDistanceLine() {
  if (!state.distanceDataSource || state.distancePath.length === 0) return;
  
  state.distanceMarkers.forEach(marker => state.map.markers.remove(marker));
  state.distanceMarkers = [];
  
  state.distanceDataSource.clear();
  
  const line = new atlas.data.LineString(state.distancePath);
  state.distanceDataSource.add(new atlas.data.Feature(line));
  
  let totalDistance = 0;
  
  for (let i = 0; i < state.distancePath.length; i++) {
    const vertexMarker = new atlas.HtmlMarker({
      position: state.distancePath[i],
      htmlContent: `
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border: 3px solid red;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      `,
      pixelOffset: [0, 0]
    });
    state.map.markers.add(vertexMarker);
    state.distanceMarkers.push(vertexMarker);
    
    if (i > 0) {
      const pos1 = new atlas.data.Position(state.distancePath[i-1][0], state.distancePath[i-1][1]);
      const pos2 = new atlas.data.Position(state.distancePath[i][0], state.distancePath[i][1]);
      const segmentDistance = atlas.math.getDistanceTo(pos1, pos2);
      totalDistance += segmentDistance;
      
      const midLng = (state.distancePath[i-1][0] + state.distancePath[i][0]) / 2;
      const midLat = (state.distancePath[i-1][1] + state.distancePath[i][1]) / 2;
      
      const distLabel = new atlas.HtmlMarker({
        position: [midLng, midLat],
        htmlContent: `
          <div style="
            background: rgba(255, 255, 255, 0.95);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            color: #d32f2f;
            border: 1px solid #d32f2f;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            white-space: nowrap;
          ">
            ${segmentDistance.toFixed(1)} m
          </div>
        `,
        pixelOffset: [0, -20]
      });
      state.map.markers.add(distLabel);
      state.distanceMarkers.push(distLabel);
    }
  }
  
  if (state.distancePath.length > 1) {
    const totalLabel = new atlas.HtmlMarker({
      position: state.distancePath[state.distancePath.length - 1],
      htmlContent: `
        <div style="
          background: rgba(211, 47, 47, 0.95);
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          color: white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          white-space: nowrap;
        ">
          Total: ${totalDistance.toFixed(2)} m
        </div>
      `,
      pixelOffset: [0, 20]
    });
    state.map.markers.add(totalLabel);
    state.distanceMarkers.push(totalLabel);
  }
}

// Style toggle
function initStyleToggle() {
  const toggleStyleBtn = document.getElementById('toggleStyle');
  
  if (!toggleStyleBtn) return;
  
  toggleStyleBtn.style.minWidth = '100px';
  toggleStyleBtn.style.fontSize = '11px';
  toggleStyleBtn.style.padding = '6px 10px';
  
  toggleStyleBtn.onclick = () => {
    if (!state.map || state.isChangingStyle) return;
    
    state.isChangingStyle = true;
    toggleStyleBtn.disabled = true;
    
    let newStyleName;
    
    if (state.currentStyle === 'road') {
      newStyleName = state.labelsVisible ? 'satellite_road_labels' : 'satellite';
      state.currentStyle = 'satellite';
      toggleStyleBtn.textContent = '🗺️ Road';
      toggleStyleBtn.style.background = '#2e7d32';
    } else {
      newStyleName = state.labelsVisible ? 'road' : 'road_shaded_relief';
      state.currentStyle = 'road';
      toggleStyleBtn.textContent = '🛰️ Satellite';
      toggleStyleBtn.style.background = '#007bff';
    }
    
    console.log('Switching to style:', newStyleName);
    
    state.map.setStyle({
      style: newStyleName
    });
    
    setTimeout(() => {
      state.isChangingStyle = false;
      toggleStyleBtn.disabled = false;
    }, 1500);
  };
}

// Label toggle
function initLabelToggle() {
  const toggleLabelsBtn = document.getElementById('toggleLabels');
  
  if (!toggleLabelsBtn) return;
  
  toggleLabelsBtn.onclick = () => {
    if (state.isChangingStyle) return;
    
    state.isChangingStyle = true;
    toggleLabelsBtn.disabled = true;
    
    state.labelsVisible = !state.labelsVisible;
    
    let newStyleName;
    
    if (state.labelsVisible) {
      toggleLabelsBtn.textContent = '🏷️ Hide Labels';
      newStyleName = state.currentStyle === 'satellite' ? 'satellite_road_labels' : 'road';
    } else {
      toggleLabelsBtn.textContent = '🏷️ Show Labels';
      newStyleName = state.currentStyle === 'satellite' ? 'satellite' : 'road_shaded_relief';
    }
    
    console.log('Switching labels to style:', newStyleName);
    
    state.map.setStyle({
      style: newStyleName
    });
    
    setTimeout(() => {
      state.isChangingStyle = false;
      toggleLabelsBtn.disabled = false;
    }, 1500);
  };
}

// Clear button
function initClearButton() {
  const clearShapeBtn = document.getElementById("clearShape");
  
  if (clearShapeBtn) {
    clearShapeBtn.onclick = clearAllShapes;
  }
}

function clearAllShapes() {
  if (state.activeShape && state.drawingManager) {
    state.drawingManager.getSource().remove(state.activeShape);
    state.activeShape = null;
  }
  if (state.areaLabel) {
    state.map.markers.remove(state.areaLabel);
    state.areaLabel = null;
  }
  if (state.distanceDataSource) {
    state.distanceDataSource.clear();
  }
  state.distanceMarkers.forEach(marker => state.map.markers.remove(marker));
  state.distanceMarkers = [];
  state.distancePath = [];
  state.measuringDistance = false;
  
  if (state.searchMarker) {
    state.map.markers.remove(state.searchMarker);
    state.searchMarker = null;
  }
}

function getShapeArea(shape) {
  if (!shape) return 0;
  
  const geometry = shape.toJson().geometry;
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates[0];
    return calculatePolygonArea(coords);
  }
  return 0;
}

// Context menu
function initContextMenu() {
  if (!elements.contextMenu) return;
  
  elements.contextMenu.addEventListener("click", e => {
    const action = e.target.dataset.action;
    elements.contextMenu.style.display = "none";

    if (!action || !state.contextLatLng) return;

    const lng = state.contextLatLng[0];
    const lat = state.contextLatLng[1];

    if (action === "drawTools") {
      showInfo(`
        <div style="font-weight: 600; margin-bottom: 8px;">📐 Drawing Tools</div>
        <button onclick="window.startDrawing('draw-polygon')" 
          style="width: 100%; margin: 4px 0; padding: 8px; border: none; background: #007bff; color: white; border-radius: 4px; cursor: pointer;">
          🔷 Draw Polygon
        </button>
        <button onclick="window.startDrawing('draw-rectangle')" 
          style="width: 100%; margin: 4px 0; padding: 8px; border: none; background: #007bff; color: white; border-radius: 4px; cursor: pointer;">
          ⬜ Draw Rectangle
        </button>
        <button onclick="window.startDrawing('edit-geometry')" 
          style="width: 100%; margin: 4px 0; padding: 8px; border: none; background: #2e7d32; color: white; border-radius: 4px; cursor: pointer;">
          ✏️ Edit Geometry
        </button>
      `);
      return;
    }

    if (action === "clear") {
      clearAllShapes();
      showInfo("✅ All shapes cleared!");
      setTimeout(hideInfo, 2000);
      return;
    }

    if (action === "coords") {
      showInfo(`
        <b>Coordinates</b><br>
        Latitude: ${lat.toFixed(6)}<br>
        Longitude: ${lng.toFixed(6)}
      `);
    }

    if (action === "area") {
      if (!state.activeShape) {
        showInfo("⚠️ Draw a polygon or rectangle first.");
        return;
      }

      const area = getShapeArea(state.activeShape);
      const areaSqFt = (area * 10.7639).toFixed(2);
      showInfo(`
        <b>Area Details</b><br>
        ${area.toFixed(2)} m²<br>
        ${areaSqFt} ft²<br>
        ${(area / 10000).toFixed(4)} ha<br>
        ${(area * 0.000247105).toFixed(4)} acres
      `);
    }

    if (action === "startDistance") {
      state.measuringDistance = true;
      state.distancePath = [];
      state.distanceMarkers.forEach(marker => state.map.markers.remove(marker));
      state.distanceMarkers = [];
      
      if (!state.distanceDataSource) {
        state.distanceDataSource = new atlas.source.DataSource();
        state.map.sources.add(state.distanceDataSource);
        
        state.map.layers.add(new atlas.layer.LineLayer(state.distanceDataSource, null, {
          strokeColor: 'red',
          strokeWidth: 3
        }));
      } else {
        state.distanceDataSource.clear();
      }
      
      showInfo("📏 Distance measurement started.<br>Click to add points.<br>Right-click → Finish to complete.");
    }

    if (action === "finishDistance") {
      state.measuringDistance = false;
      if (state.distancePath.length > 1) {
        let totalDistance = 0;
        
        for (let i = 0; i < state.distancePath.length - 1; i++) {
          const pos1 = new atlas.data.Position(state.distancePath[i][0], state.distancePath[i][1]);
          const pos2 = new atlas.data.Position(state.distancePath[i+1][0], state.distancePath[i+1][1]);
          totalDistance += atlas.math.getDistanceTo(pos1, pos2);
        }
        
        showInfo(`
          <b>Total Distance</b><br>
          ${totalDistance.toFixed(2)} m<br>
          ${(totalDistance / 1000).toFixed(3)} km<br>
          ${(totalDistance * 3.28084).toFixed(2)} ft<br>
          ${(totalDistance * 0.000621371).toFixed(3)} miles
        `);
      } else {
        showInfo("⚠️ Click at least 2 points to measure.");
      }
    }

    if (action === "export") {
      if (!state.activeShape) {
        showInfo("⚠️ Draw an area first.");
        return;
      }

      const center = state.map.getCamera().center;
      const zoom = state.map.getCamera().zoom;
      const mapType = state.map.getStyle().style;

      fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          center: center,
          zoom: Math.round(zoom),
          mapType: mapType.includes('satellite') ? 'satellite' : 'road'
        })
      })
        .then(res => {
          if (!res.ok) throw new Error('Export failed');
          return res.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "map_export.png";
          a.click();
          showInfo("✅ Map exported successfully!");
        })
        .catch((err) => {
          console.error(err);
          showInfo("❌ Export failed.");
        });
    }
  });
}

// Global function for drawing tools
window.startDrawing = function(mode) {
  state.drawingManager.setOptions({ mode: mode });
  hideInfo();
};