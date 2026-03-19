import { state } from './shared-state.js';

export function initSearchBar() {
  const searchInput = document.getElementById('mapSearchInput');
  const searchResults = document.getElementById('searchResults');
  
  if (!searchInput || !searchResults) return;
  
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 3) {
      searchResults.style.display = 'none';
      return;
    }
    
    searchTimeout = setTimeout(() => searchLocation(query), 500);
  });
  
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
}

async function searchLocation(query) {
  const searchResults = document.getElementById('searchResults');
  
  try {
    const url = `https://atlas.microsoft.com/search/fuzzy/json?` +
      `api-version=1.0` +
      `&query=${encodeURIComponent(query)}` +
      `&subscription-key=${window.azureMapsSubscriptionKey}` +
      `&limit=5`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      displaySearchResults(data.results);
    } else {
      searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
      searchResults.style.display = 'block';
    }
  } catch (error) {
    console.error('Search error:', error);
    searchResults.innerHTML = '<div class="search-result-item">Search failed</div>';
    searchResults.style.display = 'block';
  }
}

function displaySearchResults(results) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = '';
  
  results.forEach(result => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.innerHTML = `
      <div style="font-weight: 600;">${result.poi?.name || result.address.freeformAddress}</div>
      <div style="font-size: 11px; color: #666; margin-top: 2px;">${result.address.countrySubdivision || ''} ${result.address.country || ''}</div>
    `;
    
    item.onclick = () => {
      goToLocation(result.position.lat, result.position.lon, result.poi?.name || result.address.freeformAddress);
      searchResults.style.display = 'none';
      document.getElementById('mapSearchInput').value = result.address.freeformAddress;
    };
    
    searchResults.appendChild(item);
  });
  
  searchResults.style.display = 'block';
}

function goToLocation(lat, lng, name) {
  if (state.searchMarker) {
    state.map.markers.remove(state.searchMarker);
  }
  
  state.searchMarker = new atlas.HtmlMarker({
    position: [lng, lat],
    htmlContent: `
      <div style="
        background: #d32f2f;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 12px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
      ">
        📍 ${name}
      </div>
    `,
    pixelOffset: [0, -10]
  });
  
  state.map.markers.add(state.searchMarker);
  
  state.map.setCamera({
    center: [lng, lat],
    zoom: 15,
    type: 'fly',
    duration: 1000
  });
}