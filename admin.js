// =====================================================
// CALABRIA EXPLORER — admin.js
// Gestione POI completamente client-side.
// I dati sono salvati in localStorage.
// Per renderli permanenti usa "Esporta pois.js".
// =====================================================

const STORAGE_KEY = "calabria_explorer_pois";

const form        = document.getElementById("poi-form");
const resetButton = document.getElementById("reset-form");
const list        = document.getElementById("poi-list");
const total       = document.getElementById("poi-total");
const statusNode  = document.getElementById("admin-status");
const exportBtn   = document.getElementById("export-btn");
const resetDataBtn = document.getElementById("reset-data-btn");

let pois = [];

// ---- Storage ----

function loadPois() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      pois = JSON.parse(stored);
    } else {
      pois = JSON.parse(JSON.stringify(POIS_DATA)); // deep copy from pois.js
    }
  } catch {
    pois = JSON.parse(JSON.stringify(POIS_DATA));
  }
  renderList();
}

function savePoisToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pois));
}

// ---- UI helpers ----

function setStatus(msg) { statusNode.textContent = msg; }

function slugify(v) {
  return String(v || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resetForm() {
  form.reset();
  form.elements.namedItem("id").value = "";
  form.elements.namedItem("foodMinutes").value = 0;
  setStatus("Pronto");
}

function fillForm(poi) {
  for (const [key, value] of Object.entries(poi)) {
    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  }
  setStatus(`Modifica: ${poi.name}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderList() {
  total.textContent = `${pois.length} luoghi in archivio`;
  list.innerHTML = pois
    .slice()
    .sort((a, b) => a.area.localeCompare(b.area) || a.name.localeCompare(b.name))
    .map(poi => `
      <article class="admin-card">
        <div class="admin-card-head">
          <div>
            <h3>${poi.name}</h3>
            <p>${poi.area} · ${poi.categoryLabel}</p>
          </div>
          <div class="admin-card-actions">
            <button type="button" data-edit="${poi.id}" class="secondary-button">Modifica</button>
            <button type="button" data-delete="${poi.id}" class="danger-button">Elimina</button>
          </div>
        </div>
        <p>${poi.description}</p>
        <div class="admin-meta">
          <span>${poi.type}</span>
          <span>${poi.lat}, ${poi.lng}</span>
          <span>${poi.visitMinutes} min</span>
          <span>${poi.imagePath}</span>
        </div>
      </article>
    `).join("");
}

// ---- CRUD ----

form.addEventListener("submit", event => {
  event.preventDefault();
  const fd = new FormData(form);
  const raw = Object.fromEntries(fd.entries());

  const area = String(raw.area || "").trim();
  const name = String(raw.name || "").trim();
  const existingId = String(raw.id || "").trim();
  const id = existingId || slugify(`${area}-${name}`);

  const poi = {
    id,
    name,
    area,
    type: String(raw.type || "culture").trim(),
    categoryLabel: String(raw.categoryLabel || "").trim(),
    lat: Number(raw.lat),
    lng: Number(raw.lng),
    visitMinutes: Number(raw.visitMinutes) || 30,
    foodMinutes: Number(raw.foodMinutes) || 0,
    imagePath: String(raw.imagePath || `images/pois/${id}.jpg`).trim(),
    imageLabel: String(raw.imageLabel || name).trim(),
    description: String(raw.description || "").trim()
  };

  // Validate
  if (!poi.name || !poi.area || !poi.type || !poi.categoryLabel || !poi.description) {
    setStatus("Errore: compila tutti i campi obbligatori.");
    return;
  }
  if (!isFinite(poi.lat) || !isFinite(poi.lng)) {
    setStatus("Errore: latitudine e longitudine devono essere numeri validi.");
    return;
  }
  if (poi.visitMinutes <= 0) {
    setStatus("Errore: la durata visita deve essere maggiore di zero.");
    return;
  }

  if (existingId) {
    // Update
    const idx = pois.findIndex(p => p.id === existingId);
    if (idx !== -1) pois[idx] = poi;
    setStatus(`Luogo aggiornato: ${poi.name}`);
  } else {
    // Create — check duplicate id
    if (pois.some(p => p.id === id)) {
      setStatus(`Errore: esiste gia un luogo con id "${id}". Modifica il nome o l'area.`);
      return;
    }
    pois.push(poi);
    setStatus(`Luogo aggiunto: ${poi.name}`);
  }

  savePoisToStorage();
  renderList();
  resetForm();
});

resetButton.addEventListener("click", resetForm);

list.addEventListener("click", event => {
  const editId   = event.target.getAttribute("data-edit");
  const deleteId = event.target.getAttribute("data-delete");

  if (editId) {
    const poi = pois.find(p => p.id === editId);
    if (poi) fillForm(poi);
  }

  if (deleteId) {
    if (!confirm(`Eliminare "${pois.find(p=>p.id===deleteId)?.name}"?`)) return;
    pois = pois.filter(p => p.id !== deleteId);
    savePoisToStorage();
    renderList();
    resetForm();
    setStatus("Luogo eliminato.");
  }
});

// ---- Export ----

exportBtn.addEventListener("click", () => {
  const content = `// Calabria Explorer — Punti di interesse\n// Generato da Admin il ${new Date().toLocaleDateString("it-IT")}\nconst POIS_DATA = ${JSON.stringify(pois, null, 2)};\n`;
  const blob = new Blob([content], { type: "text/javascript" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "pois.js";
  a.click();
  URL.revokeObjectURL(url);
  setStatus("File pois.js esportato. Sostituisci il file nella cartella del sito.");
});

resetDataBtn.addEventListener("click", () => {
  if (!confirm("Ripristinare i dati originali? Tutte le modifiche locali andranno perse.")) return;
  localStorage.removeItem(STORAGE_KEY);
  pois = JSON.parse(JSON.stringify(POIS_DATA));
  savePoisToStorage();
  renderList();
  resetForm();
  setStatus("Dati ripristinati ai valori originali.");
});

// ---- Init ----
loadPois();
