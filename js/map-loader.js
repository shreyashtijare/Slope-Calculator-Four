let mapsLoaded = false;

export async function loadAzureMaps() {
  if (mapsLoaded) return true;
  
  try {
    const response = await fetch('/api/maps-config');
    const data = await response.json();
    
    if (!data.subscriptionKey) {
      console.error('No subscription key received');
      return false;
    }
    
    window.azureMapsSubscriptionKey = data.subscriptionKey;
    
    const mapScript = document.createElement('script');
    mapScript.src = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js';
    
    await new Promise((resolve, reject) => {
      mapScript.onload = resolve;
      mapScript.onerror = reject;
      document.head.appendChild(mapScript);
    });
    
    const drawScript = document.createElement('script');
    drawScript.src = 'https://atlas.microsoft.com/sdk/javascript/drawing/0/atlas-drawing.min.js';
    
    await new Promise((resolve, reject) => {
      drawScript.onload = () => {
        mapsLoaded = true;
        resolve();
      };
      drawScript.onerror = reject;
      document.head.appendChild(drawScript);
    });
    
    console.log('Azure Maps loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading Azure Maps:', error);
    return false;
  }
}