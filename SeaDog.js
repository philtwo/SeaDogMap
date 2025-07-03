const sharks = [
    { id: 1, name: "Bruce", species: "Great White", lat: 36.7783, lng: -119.4179, status: "active", depth: 42, lastPing: "2 min ago" },
    { id: 2, name: "Jaws", species: "Great White", lat: 34.0522, lng: -118.2437, status: "active", depth: 38, lastPing: "5 min ago" },
    { id: 3, name: "Hammertime", species: "Hammerhead", lat: 32.7157, lng: -117.1611, status: "active", depth: 52, lastPing: "1 min ago" },
    { id: 4, name: "Stripes", species: "Tiger", lat: 25.7617, lng: -80.1918, status: "inactive", depth: 65, lastPing: "2 hours ago" },
    { id: 5, name: "Chomper", species: "Bull", lat: 29.7604, lng: -95.3698, status: "active", depth: 28, lastPing: "3 min ago" },
    { id: 6, name: "Megalodon Jr", species: "Great White", lat: 37.7749, lng: -122.4194, status: "active", depth: 48, lastPing: "1 min ago" },
    { id: 7, name: "Hammer", species: "Hammerhead", lat: 26.0112, lng: -80.1378, status: "active", depth: 35, lastPing: "4 min ago" },
    { id: 8, name: "Finnegan", species: "Tiger", lat: 21.3099, lng: -157.8581, status: "active", depth: 71, lastPing: "2 min ago" },
    { id: 9, name: "Sharkira", species: "Bull", lat: 27.9506, lng: -82.4572, status: "inactive", depth: 33, lastPing: "1 hour ago" },
    { id: 10, name: "Deep Blue", species: "Great White", lat: 40.7128, lng: -74.0060, status: "active", depth: 89, lastPing: "6 min ago" },
    { id: 11, name: "Sickle", species: "Hammerhead", lat: 33.6846, lng: -116.2437, status: "inactive", depth: 44, lastPing: "3 hours ago" },
    { id: 12, name: "Torpedo", species: "Tiger", lat: 35.2271, lng: -80.8431, status: "active", depth: 56, lastPing: "1 min ago" }
];

const southWest = L.latLng(-100, -190);
const northEast = L.latLng(100, 190);
const bounds = L.latLngBounds(southWest, northEast);

const map = L.map('map', {
    center: [32.0, -117.0],
    zoom: 5,
    zoomControl: false,
    maxBounds: bounds,
    maxBoundsViscosity: 0,
    worldCopyJump: false,
    minZoom: 3
});

// Add zoom control in different position
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const createSharkIcon = (species, isActive) => {
    const colors = {
        'Great White': '#ef4444',
        'Hammerhead': '#f59e0b',
        'Tiger': '#8b5cf6',
        'Bull': '#10b981'
    };
    
    const color = colors[species] || '#3b82f6';
    const opacity = isActive ? 1 : 0.6;
    
    return L.divIcon({
        html: `<div style="
            width: 20px;
            height: 20px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            opacity: ${opacity};
            ${isActive ? 'animation: pulse 2s infinite;' : ''}
        "></div>`,
        className: 'shark-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

const markers = {};

const addMarkers = () => {
    // Clear existing markers
    Object.values(markers).forEach(marker => map.removeLayer(marker));
    
    filteredSharks.forEach(shark => {
        const icon = createSharkIcon(shark.species, shark.status === 'active');
        const marker = L.marker([shark.lat, shark.lng], { icon }).addTo(map);
        
        // Create popup content
        const popupContent = `
            <div class="shark-popup">
                <div class="popup-name">${shark.name}</div>
                <div class="popup-species">${shark.species} Shark</div>
                <div class="popup-details">
                    <strong>Status:</strong> ${shark.status}<br>
                    <strong>Depth:</strong> ${shark.depth}m<br>
                    <strong>Last Ping:</strong> ${shark.lastPing}
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        markers[shark.id] = marker;
    });
}

const filterSharks = () => {
    const activeSpeciesFilter = document.querySelector('.filter-btn[data-filter].active')?.dataset.filter || 'all';
    const activeStatusFilter = document.querySelector('.filter-btn[data-status].active')?.dataset.status || 'all';
    
    filteredSharks = sharks.filter(shark => {
        const speciesMatch = activeSpeciesFilter === 'all' || 
            shark.species.toLowerCase().replace(' ', '-') === activeSpeciesFilter;
        const statusMatch = activeStatusFilter === 'all' || 
            shark.status === activeStatusFilter;
        return speciesMatch && statusMatch;
    });
    
    addMarkers();
    updateSharkList();
    updateStats();
};

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const filterType = e.target.dataset.filter ? 'filter' : 'status';
        
        // Remove active class from siblings
        document.querySelectorAll(`.filter-btn[data-${filterType}]`)
            .forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        filterSharks();
    });
});

const updateSharkList = () => {
    const sharkListEl = document.getElementById('sharkList');
    sharkListEl.innerHTML = '';
    
    filteredSharks.forEach(shark => {
        const sharkEl = document.createElement('div');
        sharkEl.className = 'shark-item';
        sharkEl.innerHTML = `
            <div class="shark-name">${shark.name}</div>
            <div class="shark-species">${shark.species} Shark</div>
            <div class="shark-status">
                <span class="status-dot ${shark.status === 'active' ? 'status-active' : 'status-inactive'}"></span>
                <span>${shark.status} • ${shark.lastPing}</span>
            </div>
        `;
        
        // Add click handler for map navigation
        sharkEl.addEventListener('click', () => {
            map.setView([shark.lat, shark.lng], 8);
            if (markers[shark.id]) {
                markers[shark.id].openPopup();
            }
        });
        
        sharkListEl.appendChild(sharkEl);
    });
};

const updateStats = () => {
    const activeSharks = filteredSharks.filter(s => s.status === 'active');
    const totalDepth = filteredSharks.reduce((sum, s) => sum + s.depth, 0);
    const avgDepth = Math.round(totalDepth / filteredSharks.length);
    
    document.getElementById('totalSharks').textContent = filteredSharks.length;
    document.getElementById('activeSharks').textContent = activeSharks.length;
    document.getElementById('recentPings').textContent = activeSharks.length * 3;
    document.getElementById('avgDepth').textContent = avgDepth + 'm';
};

setInterval(() => {
    sharks.forEach(shark => {
        if (shark.status === 'active' && Math.random() < 0.3) {
            // Slightly move active sharks
            shark.lat += (Math.random() - 0.5) * 0.01;
            shark.lng += (Math.random() - 0.5) * 0.01;
            
            // Update marker position
            if (markers[shark.id]) {
                markers[shark.id].setLatLng([shark.lat, shark.lng]);
            }
        }
    });
}, 5000);

// Debug function to check filter state
const debugFilters = () => {
    console.log('Active filters:', {
        species: document.querySelector('.filter-btn[data-filter].active')?.dataset.filter,
        status: document.querySelector('.filter-btn[data-status].active')?.dataset.status,
        filteredCount: filteredSharks.length
    });
};

const safeUpdateMarkers = () => {
    try {
        addMarkers();
    } catch (error) {
        console.error('Error updating markers:', error);
        // Fallback to simple markers
        sharks.forEach(shark => {
            L.marker([shark.lat, shark.lng]).addTo(map);
        });
    }
};

// Debounce filter updates
let filterTimeout;
const debouncedFilter = () => {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(filterSharks, 100);
};

// Use requestAnimationFrame for smooth updates
const smoothUpdateStats = () => {
    requestAnimationFrame(updateStats);
};

filterSharks();
