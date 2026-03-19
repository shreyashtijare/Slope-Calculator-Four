import { state, elements } from './shared-state.js';
import { loadAzureMaps } from './map-loader.js';
import { initMap } from './map-core.js';

export function initUIControls() {
  // Sidebar toggle
  if (elements.sidebarToggle) {
    elements.sidebarToggle.onclick = () => {
      elements.sidebar.classList.toggle("open");
    };
  }

  // Panel navigation
  document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      if (elements.sidebar) elements.sidebar.classList.remove("open");

      elements.panels.forEach(p => p.classList.remove("active"));
      const target = document.getElementById(link.dataset.panel);
      if (target) target.classList.add("active");

      if (link.dataset.panel === "mapPanel") {
        if (!state.mapInitialized) {
          const loaded = await loadAzureMaps();
          if (loaded) {
            initMap();
            state.mapInitialized = true;
          } else {
            alert('Failed to load Azure Maps.');
          }
        } else if (state.map) {
          state.map.resize();
        }
      }
    });
  });
}