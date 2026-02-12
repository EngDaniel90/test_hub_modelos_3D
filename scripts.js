let allData = [];
let map = null;
let markers = [];
const CITY_COORDINATES = {
    'TUAS': [1.2944, 103.6358],
    'Angra': [-23.0067, -44.3189],
    'Aracruz': [-19.8203, -40.2733],
    'Batam': [1.1283, 104.0531],
    'Nantong': [31.9802, 120.8943],
    'Haiyang': [36.7767, 121.1594],
    'Yantai': [37.5333, 121.4000]
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Loader Sequence
    setTimeout(() => {
        document.getElementById('app-loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('app-loader').style.display = 'none';
        }, 700);
    }, 1500);

    // Date
    const dateOpts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', dateOpts).toUpperCase();

    fetch('links.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            updateStats(data);
            renderSection(data, 'TOPSIDE', 'topside-section');
            renderSection(data, 'HULL', 'hull-section');
        })
        .catch(error => console.error('Error loading links:', error));
});

function updateStats(data) {
    const hullCount = data.filter(d => d.group === 'HULL').length;
    const topsideCount = data.filter(d => d.group === 'TOPSIDE').length;
    const uniqueLocs = new Set();
    
    data.forEach(item => {
        if(item.projects?.P84?.city) uniqueLocs.add(item.projects.P84.city);
        if(item.projects?.P85?.city) uniqueLocs.add(item.projects.P85.city);
    });

    animateValue('stat-topside', 0, topsideCount, 1000);
    animateValue('stat-hull', 0, hullCount, 1000);
    animateValue('stat-locs', 0, uniqueLocs.size, 1000);
    animateValue('stat-total', 0, data.length, 1500);
    document.getElementById('total-modules-count').innerText = String(data.length).padStart(2, '0');
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function renderSection(data, groupName, containerId) {
    const container = document.getElementById(containerId);
    const wrapper = document.getElementById(`${containerId}-wrapper`);
    const filteredData = data.filter(item => item.group === groupName);

    if (filteredData.length > 0) {
        wrapper.classList.remove('hidden');
        filteredData.forEach((item, index) => {
            const card = createCard(item, index);
            container.appendChild(card);
        });
    }
}

function createCard(item, index) {
    const div = document.createElement('div');
    const isHull = item.group === 'HULL';
    const delay = index * 50; // Stagger effect
    
    let gridSpan = '';
    // Custom grid logic for Hull visual layout
    if (isHull) {
        if (item.title.includes('ALL')) gridSpan = 'md:col-span-2 lg:col-span-2'; 
    }

    div.className = `tech-card rounded-xl flex flex-col group cursor-pointer ${gridSpan} corner-accents opacity-0`;
    div.style.animation = `fadeIn 0.5s ease-out forwards ${delay}ms`;
    
    const imagePath = item.filename ? `images/${item.filename}` : `images/${item.image || 'Hull.png'}`;

    div.innerHTML = `
        <div class="relative h-48 w-full overflow-hidden bg-dark-800" onclick="openModal('${item.title}')">
            <img src="${imagePath}" alt="${item.title}" 
                 class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100 mix-blend-overlay"
                 onerror="this.parentElement.innerHTML='<div class=\'w-full h-full flex items-center justify-center bg-slate-900\'><i class=\'fa-solid fa-cube text-slate-700 text-3xl\'></i></div>'">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            
            <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                <div class="w-8 h-8 rounded bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-${isHull ? 'neon-amber' : 'neon-blue'} hover:text-black transition-colors">
                    <i class="fa-solid fa-expand text-xs"></i>
                </div>
            </div>
            
            <div class="absolute bottom-3 left-3">
                 <span class="text-[9px] font-mono font-bold bg-black/50 px-1.5 py-0.5 rounded text-${isHull ? 'neon-amber' : 'neon-blue'} border border-${isHull ? 'neon-amber' : 'neon-blue'}/30">
                    ${isHull ? 'HULL-SEC' : 'TOPSIDE-MOD'}
                 </span>
            </div>
        </div>

        <div class="p-5 flex flex-col flex-grow" onclick="openModal('${item.title}')">
            <h3 class="text-lg font-bold text-white group-hover:text-${isHull ? 'neon-amber' : 'neon-blue'} transition-colors font-display mb-1 truncate">${item.title}</h3>
            <p class="text-xs text-slate-400 line-clamp-2 mb-4 font-sans leading-relaxed min-h-[2.5em]">${item.description}</p>
            
            <div class="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
                <div class="flex flex-col">
                    <span>LOC: ${item.projects?.P84?.city || 'N/A'}</span>
                    <span class="text-[9px] opacity-60">ID: ${Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                </div>
                <i class="fa-solid fa-chevron-right text-xs group-hover:translate-x-1 transition-transform text-white"></i>
            </div>
        </div>
    `;
    return div;
}

// Modal Logic
const modal = document.getElementById('modal');
const modalPanel = document.getElementById('modal-panel');
const modalBackdrop = document.getElementById('modal-backdrop');

function openModal(title) {
    const item = allData.find(d => d.title === title);
    if (!item) return;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modalBackdrop.classList.add('modal-enter');
        modalPanel.classList.add('modal-panel-enter');
    }, 10);

    const isHull = item.group === 'HULL';
    const accentColor = isHull ? 'text-neon-amber' : 'text-neon-blue';
    const imagePath = item.filename ? `images/${item.filename}` : `images/${item.image || 'Hull.png'}`;

    document.getElementById('modal-title').innerText = item.title;
    document.getElementById('modal-subtitle').innerHTML = `<i class="fa-solid fa-tag mr-2"></i>${item.group} DIVISION`;
    document.getElementById('modal-subtitle').className = `text-sm font-mono ${accentColor}`;

    const imgContainer = document.getElementById('modal-image-container');
    imgContainer.innerHTML = `<img src="${imagePath}" class="w-full h-full object-cover">`;

    // Generate Content
    let contentHtml = `
        <div>
            <span class="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">System Description</span>
            <p class="text-sm text-slate-300 leading-relaxed">${item.description || 'No technical description available.'}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/5 p-3 rounded border border-white/10">
                <span class="text-[9px] text-slate-500 uppercase block mb-1">Project P84</span>
                <div class="text-white font-mono text-xs flex items-center gap-2">
                    <i class="fa-solid fa-location-dot ${accentColor}"></i>
                    ${item.projects?.P84?.city || 'N/A'}, ${item.projects?.P84?.country || ''}
                </div>
            </div>
            <div class="bg-white/5 p-3 rounded border border-white/10">
                <span class="text-[9px] text-slate-500 uppercase block mb-1">Project P85</span>
                <div class="text-white font-mono text-xs flex items-center gap-2">
                    <i class="fa-solid fa-location-dot ${accentColor}"></i>
                    ${item.projects?.P85?.city || 'N/A'}, ${item.projects?.P85?.country || ''}
                </div>
            </div>
        </div>

        ${item.disclaimer ? `
        <div class="flex gap-3 items-start p-3 bg-amber-500/10 border border-amber-500/20 rounded">
            <i class="fa-solid fa-triangle-exclamation text-amber-500 text-xs mt-0.5"></i>
            <p class="text-[10px] text-amber-200/80 leading-snug">${item.disclaimer}</p>
        </div>` : ''}
    `;
    
    document.getElementById('modal-content').innerHTML = contentHtml;

    // Buttons
    let btnsHtml = '';
    if (item.options) {
        item.options.forEach(opt => {
            const isFusion = opt.label.includes('Fusion');
            btnsHtml += `
                <a href="${opt.url}" target="_blank" class="flex items-center justify-center gap-2 w-full py-3 rounded font-bold text-xs uppercase tracking-wider transition-all ${isFusion ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20 hover:brightness-110' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}">
                    ${isFusion ? '<i class="fa-solid fa-cube"></i>' : '<i class="fa-solid fa-cloud"></i>'}
                    ${opt.label}
                </a>
            `;
        });
    }
    document.getElementById('modal-footer').innerHTML = btnsHtml;
}

function closeModal() {
    modalBackdrop.classList.remove('modal-enter');
    modalPanel.classList.remove('modal-panel-enter');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// Navigation & Map Logic
function switchTab(tab) {
    const models = document.getElementById('view-models');
    const sites = document.getElementById('view-sites');
    const navModels = document.getElementById('nav-models');
    const navSites = document.getElementById('nav-sites');
    const title = document.getElementById('page-title');

    if (tab === 'models') {
        models.classList.remove('hidden');
        sites.classList.add('hidden');
        navModels.classList.add('active-nav');
        navModels.classList.remove('text-slate-500');
        navSites.classList.remove('active-nav');
        navSites.classList.add('text-slate-500');
        title.innerText = "Model Overview";
    } else {
        models.classList.add('hidden');
        sites.classList.remove('hidden');
        navSites.classList.add('active-nav');
        navSites.classList.remove('text-slate-500');
        navModels.classList.remove('active-nav');
        navModels.classList.add('text-slate-500');
        title.innerText = "Global Construction Tracker";
        
        if (!map) initMap();
        else setTimeout(() => map.invalidateSize(), 100);
    }
}

function initMap() {
    map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        zoomControl: false,
        attributionControl: false
    });

    // Dark Matter Tiles (CartoDB) - Free for non-commercial use mostly, looks way better
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    renderMarkers('ALL');
}

function renderMarkers(filterGroup) {
    if (markers.length) markers.forEach(m => map.removeLayer(m));
    markers = [];

    const cityGroups = {};
    allData.forEach(item => {
        if (filterGroup !== 'ALL' && item.group !== filterGroup) return;
        ['P84', 'P85'].forEach(proj => {
            const city = item.projects?.[proj]?.city;
            if (city && CITY_COORDINATES[city]) {
                if (!cityGroups[city]) cityGroups[city] = { modules: [], hasHull: false };
                cityGroups[city].modules.push(item);
                if (item.group === 'HULL') cityGroups[city].hasHull = true;
            }
        });
    });

    Object.keys(cityGroups).forEach(city => {
        const data = cityGroups[city];
        const isHull = data.hasHull;
        const coords = CITY_COORDINATES[city];

        const iconHtml = `<div class="marker-pin ${isHull ? 'hull-marker' : ''}"></div>`;
        const icon = L.divIcon({ html: iconHtml, className: 'bg-transparent', iconSize: [12, 12] });

        const marker = L.marker(coords, { icon: icon }).addTo(map);
        marker.on('click', () => showSiteInfo(city, data));
        markers.push(marker);
    });
}

function filterMap(group) {
    document.querySelectorAll('.map-ctrl').forEach(b => {
        b.classList.toggle('active', b.dataset.group === group);
    });
    renderMarkers(group);
}

function showSiteInfo(city, data) {
    const container = document.getElementById('site-info');
    const count = data.modules.length;
    const hasHull = data.hasHull;
    
    // Sort: Hull first, then alphabetical
    const sorted = [...new Set(data.modules)].sort((a,b) => {
        if (a.group === 'HULL' && b.group !== 'HULL') return -1;
        if (a.group !== 'HULL' && b.group === 'HULL') return 1;
        return a.title.localeCompare(b.title);
    });

    let listHtml = sorted.map(m => `
        <div class="p-3 mb-2 rounded border ${m.group === 'HULL' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/10'} hover:bg-white/10 cursor-pointer flex justify-between items-center group transition-colors" onclick="openModal('${m.title}')">
            <div>
                <div class="text-xs font-bold text-white group-hover:text-neon-blue">${m.title}</div>
                <div class="text-[9px] text-slate-500">${m.group}</div>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-600 group-hover:text-white"></i>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="animate-enter">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-display font-bold text-white">${city}</h2>
                    <span class="text-xs font-mono text-neon-blue">ACTIVE YARD</span>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-white font-mono">${count}</div>
                    <div class="text-[9px] text-slate-500 uppercase">Modules</div>
                </div>
            </div>
            
            ${hasHull ? `<div class="mb-4 p-2 bg-neon-amber/10 border border-neon-amber/20 rounded text-center text-[10px] font-bold text-neon-amber uppercase tracking-widest"><i class="fa-solid fa-ship mr-2"></i>Hull Construction Site</div>` : ''}
            
            <div class="h-[1px] w-full bg-white/10 mb-4"></div>
            <div class="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                ${listHtml}
            </div>
        </div>
    `;
}