import { state } from './shared-state.js';

export function initNavigationControls() {
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const rotateLeftBtn = document.getElementById('rotateLeft');
  const rotateRightBtn = document.getElementById('rotateRight');
  const resetNorthBtn = document.getElementById('resetNorth');
  const lockRotationBtn = document.getElementById('lockRotation');  // NEW

  if (zoomInBtn) {
    zoomInBtn.onclick = () => {
      const currentZoom = state.map.getCamera().zoom;
      state.map.setCamera({ zoom: currentZoom + 1, type: 'ease', duration: 300 });
    };
  }

  if (zoomOutBtn) {
    zoomOutBtn.onclick = () => {
      const currentZoom = state.map.getCamera().zoom;
      state.map.setCamera({ zoom: currentZoom - 1, type: 'ease', duration: 300 });
    };
  }

  if (rotateLeftBtn) {
    rotateLeftBtn.onclick = () => {
      if (state.isRotationLocked) {
        alert('Rotation is locked. Click the 🔒 button to unlock.');
        return;
      }
      const currentBearing = state.map.getCamera().bearing || 0;
      state.map.setCamera({ bearing: currentBearing - 15, type: 'ease', duration: 300 });
    };
  }

  if (rotateRightBtn) {
    rotateRightBtn.onclick = () => {
      if (state.isRotationLocked) {
        alert('Rotation is locked. Click the 🔒 button to unlock.');
        return;
      }
      const currentBearing = state.map.getCamera().bearing || 0;
      state.map.setCamera({ bearing: currentBearing + 15, type: 'ease', duration: 300 });
    };
  }

  if (resetNorthBtn) {
    resetNorthBtn.onclick = () => {
      state.map.setCamera({ 
        bearing: 0, 
        pitch: 0,
        type: 'ease', 
        duration: 500 
      });
    };
  }

  // NEW: Lock/Unlock rotation button
  if (lockRotationBtn) {
    updateLockButton(lockRotationBtn);
    
    lockRotationBtn.onclick = () => {
      state.isRotationLocked = !state.isRotationLocked;
      
      // Enable or disable rotation interactions
      state.map.setUserInteraction({
        dragRotateInteraction: !state.isRotationLocked,
        touchRotateInteraction: !state.isRotationLocked
      });
      
      // If locking, reset to north
      if (state.isRotationLocked) {
        state.map.setCamera({ 
          bearing: 0, 
          pitch: 0,
          type: 'ease', 
          duration: 500 
        });
      }
      
      updateLockButton(lockRotationBtn);
    };
  }
}

function updateLockButton(button) {
  if (state.isRotationLocked) {
    button.textContent = '🔒';
    button.title = 'Unlock Rotation';
    button.style.background = '#d32f2f';
  } else {
    button.textContent = '🔓';
    button.title = 'Lock to North';
    button.style.background = '#2e7d32';
  }
}