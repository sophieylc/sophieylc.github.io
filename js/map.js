
const categoryMeta = {
  city: ["🏙️", "City"],
  lodging: ["🏨", "Lodging"],
  food: ["🍜", "Food"],
  cafe: ["☕", "Cafe"],
  attraction: ["🏛️", "Attraction"],
  museum: ["🏺", "Museum"],
  temple: ["🛕", "Temple"],
  church: ["⛪", "Church"],
  theater: ["🎭", "Theater"],
  market: ["🛍️", "Market"],
  nature: ["🌿", "Nature"],
  family: ["👪", "Family"],
  shopping: ["👟", "Shopping"],
  transport: ["🚆", "Transport"],
  activity: ["🚣", "Activity"],
  basketball: ["🏀", "Basketball"],
  skip: ["🚫", "Skip"]
};

const map = L.map("map").setView([16.5, 106.0], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);
let markersById = {};
let activeCategories = new Set(Object.keys(categoryMeta));
let searchTerm = "";

function esc(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function commentKey(id) {
  return `vietnam-trip-comment-${id}`;
}

window.saveComment = function(id) {
  const el = document.getElementById(`comment-${id}`);
  if (!el) return;
  localStorage.setItem(commentKey(id), el.value);
  const status = document.getElementById(`saved-${id}`);
  if (status) {
    status.textContent = "Saved";
    setTimeout(() => status.textContent = "", 1200);
  }
}

function iconFor(category) {
  const [emoji] = categoryMeta[category] || ["📍"];
  return L.divIcon({
    html: `<div style="
      width:34px;height:34px;border-radius:50%;
      background:white;border:2px solid #111827;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 10px rgba(0,0,0,.2);
      font-size:18px;">${emoji}</div>`,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
}

function popupHtml(p) {
  const saved = localStorage.getItem(commentKey(p.id)) || "";
  const [emoji, label] = categoryMeta[p.category] || ["📍", p.category];
  const image = p.photo
    ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}">`
    : `<div class="placeholder-photo">${emoji}</div>`;

  return `
    <div class="popup-card">
      ${image}
      <h3 style="margin:10px 0 4px">${esc(p.name)}</h3>
      <div class="badge">${emoji} ${esc(label)} · ${esc(p.city)}</div>
      <p style="margin:8px 0">${esc(p.description || "")}</p>
      <a href="${esc(p.maps)}" target="_blank" rel="noopener">Open in Google Maps ↗</a>
      <label style="display:block;margin-top:10px;font-weight:700">Comments / notes</label>
      <textarea id="comment-${esc(p.id)}" placeholder="Type notes for this place...">${esc(saved)}</textarea>
      <button onclick="saveComment('${esc(p.id)}')">Save note</button>
      <span id="saved-${esc(p.id)}" style="margin-left:8px;color:#166534;font-weight:700"></span>
    </div>
  `;
}

function visiblePlaces() {
  return window.TRIP_LOCATIONS.filter(p => {
    const matchesCategory = activeCategories.has(p.category);
    const blob = `${p.name} ${p.city} ${p.category} ${p.description}`.toLowerCase();
    const matchesSearch = !searchTerm || blob.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
}

function renderMarkers() {
  markerLayer.clearLayers();
  markersById = {};
  const visible = visiblePlaces();

  visible.forEach(p => {
    const marker = L.marker([p.lat, p.lng], { icon: iconFor(p.category) })
      .bindPopup(popupHtml(p));
    marker.addTo(markerLayer);
    markersById[p.id] = marker;
  });

  renderList(visible);

  if (visible.length > 0) {
    const bounds = L.latLngBounds(visible.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
  }
}

function renderFilters() {
  const wrap = document.getElementById("filters");
  wrap.innerHTML = Object.entries(categoryMeta).map(([key, [emoji, label]]) => `
    <label>
      <input type="checkbox" data-category="${key}" checked>
      ${emoji} ${label}
    </label>
  `).join("");

  wrap.addEventListener("change", e => {
    if (!e.target.matches("input[type=checkbox]")) return;
    const cat = e.target.dataset.category;
    if (e.target.checked) activeCategories.add(cat);
    else activeCategories.delete(cat);
    renderMarkers();
  });
}

function renderList(items) {
  const list = document.getElementById("locationList");
  document.getElementById("count").textContent = `${items.length} places`;
  list.innerHTML = items.map(p => {
    const [emoji, label] = categoryMeta[p.category] || ["📍", p.category];
    return `
      <div class="location-item" data-id="${esc(p.id)}">
        <strong>${emoji} ${esc(p.name)}</strong><br>
        <span class="muted">${esc(p.city)} · ${esc(label)}</span>
      </div>
    `;
  }).join("");

  list.querySelectorAll(".location-item").forEach(el => {
    el.addEventListener("click", () => {
      const p = window.TRIP_LOCATIONS.find(x => x.id === el.dataset.id);
      const marker = markersById[el.dataset.id];
      if (p && marker) {
        map.setView([p.lat, p.lng], 15);
        marker.openPopup();
      }
    });
  });
}

document.getElementById("search").addEventListener("input", e => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderMarkers();
});

document.getElementById("showAll").addEventListener("click", () => {
  activeCategories = new Set(Object.keys(categoryMeta));
  document.querySelectorAll("#filters input").forEach(x => x.checked = true);
  renderMarkers();
});

document.getElementById("hideAll").addEventListener("click", () => {
  activeCategories = new Set();
  document.querySelectorAll("#filters input").forEach(x => x.checked = false);
  renderMarkers();
});

renderFilters();
renderMarkers();
