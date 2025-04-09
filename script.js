let map;
let markers = [];
let currentCategory = '';
let currentLocation = '';

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadResources();
  setupFilters();
  
  // Initialize the display text
  const categoryDisplay = document.getElementById('category-display');
  const locationDisplay = document.getElementById('location-display');
  
  // Set initial display text to "Select Category..." and "Select Location..."
  categoryDisplay.textContent = "Select Category...";
  locationDisplay.textContent = "Select Location...";
});

function initMap() {
  map = L.map('map').setView([54.5, -2], 6); // Center on UK

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

async function loadResources() {
  try {
    console.log('Loading resources...');
    const response = await fetch('./data/resources.json');
    if (!response.ok) {
      throw new Error('Failed to load resources');
    }
    const data = await response.json();
    console.log(`Loaded ${data.resources.length} resources`);
    displayResources(data.resources);
  } catch (error) {
    console.error('Error loading resources:', error);
  }
}

function displayResources(resources) {
  console.log('Displaying resources with filters:');
  console.log(`- Category: ${currentCategory || 'All'}`);
  console.log(`- Location: ${currentLocation || 'All'}`);
  
  const grid = document.querySelector('.business-grid');
  grid.innerHTML = '';
  
  let filteredCount = 0;
  
  resources.forEach(resource => {
    if (shouldDisplayResource(resource)) {
      const card = createResourceCard(resource);
      grid.appendChild(card);
      addMarkerToMap(resource);
      filteredCount++;
    }
  });
  
  console.log(`Displayed ${filteredCount} resources after filtering`);
}

function createResourceCard(resource) {
  const card = document.createElement('a');
  card.href = `profile.html?id=${resource.id}`;
  card.className = 'business-card';

  card.innerHTML = `
    <span class="category">${resource.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
    <h3>${resource.name}</h3>
    <p>${resource.address}</p>
    <div class="business-info">
      <span>${resource.location}</span>
      <span class="rating">${'★'.repeat(resource.rating)}${'☆'.repeat(5-resource.rating)}</span>
    </div>
  `;

  return card;
}

function addMarkerToMap(resource) {
  const marker = L.marker([resource.lat, resource.lng])
    .bindPopup(`
      <strong>${resource.name}</strong><br>
      <em>${resource.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</em><br>
      ${resource.address}<br>
      <a href="profile.html?id=${resource.id}">View Details</a>
    `);

  markers.push(marker);
  marker.addTo(map);
}

function setupFilters() {
  console.log('Setting up filter selects');
  
  // Get the select elements
  const categorySelect = document.getElementById('category-select');
  const locationSelect = document.getElementById('location-select');
  
  // Get the display elements
  const categoryDisplay = document.getElementById('category-display');
  const locationDisplay = document.getElementById('location-display');
  
  // Add change event listeners
  categorySelect.addEventListener('change', function() {
    const selectedIndex = this.selectedIndex;
    
    // Skip the hidden placeholder option
    if (selectedIndex === 0) {
      return;
    }
    
    currentCategory = this.value;
    
    // Get the selected option text
    const selectedOption = categorySelect.options[selectedIndex];
    categoryDisplay.textContent = selectedOption.textContent;
    
    console.log(`Category changed to: ${currentCategory || 'All'}`);
    applyFilters();
  });
  
  locationSelect.addEventListener('change', function() {
    const selectedIndex = this.selectedIndex;
    
    // Skip the hidden placeholder option
    if (selectedIndex === 0) {
      return;
    }
    
    currentLocation = this.value;
    
    // Get the selected option text
    const selectedOption = locationSelect.options[selectedIndex];
    locationDisplay.textContent = selectedOption.textContent;
    
    console.log(`Location changed to: ${currentLocation || 'All'}`);
    applyFilters();
  });
  
  // Search button click event
  document.querySelector('.search-button').addEventListener('click', () => {
    console.log('Search button clicked, applying filters');
    applyFilters();
  });
}

function shouldDisplayResource(resource) {
  console.log(`Checking resource: ${resource.name}`);
  console.log(`Current filters - Category: ${currentCategory || 'None'}, Location: ${currentLocation || 'None'}`);
  
  // Format the resource location to match the data-value format in the dropdown
  const formattedResourceLocation = resource.location.toLowerCase().replace(/\s+/g, '-');
  
  if (currentCategory && resource.category !== currentCategory) {
    console.log(`Category mismatch: ${resource.category} != ${currentCategory}`);
    return false;
  }

  if (currentLocation && formattedResourceLocation !== currentLocation) {
    console.log(`Location mismatch: ${formattedResourceLocation} != ${currentLocation}`);
    return false;
  }

  console.log(`Resource ${resource.name} matches current filters`);
  return true;
}

function applyFilters() {
  console.log('Applying filters...');
  console.log(`Current filters - Category: ${currentCategory || 'None'}, Location: ${currentLocation || 'None'}`);
  
  clearMarkers();
  loadResources();
}

function clearMarkers() {
  console.log(`Clearing ${markers.length} markers from map`);
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
}