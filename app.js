// =====================================================
// CALABRIA EXPLORER — app.js
// Funziona completamente senza server.
// La chiave Anthropic è opzionale: se assente usa la
// logica locale di fallback per generare l'itinerario.
// =====================================================

const categoryStyles = {
  culture:  { label: "Cultura",   color: "#cf5c36" },
  panorama: { label: "Panorama",  color: "#0f6e8c" },
  nature:   { label: "Relax",     color: "#5b8c5a" },
  food:     { label: "Food",      color: "#f29f05" }
};

const state = { map: null, pointsOfInterest: [] };

const poiCount       = document.getElementById("poi-count");
const legend         = document.getElementById("legend");
const durationSlider = document.getElementById("durationHours");
const durationValue  = document.getElementById("durationValue");
const plannerForm    = document.getElementById("planner-form");
const output         = document.getElementById("itinerary-output");
const sourceNote     = document.getElementById("generation-source");

durationSlider.addEventListener("input", () => {
  durationValue.textContent = `${durationSlider.value} ore`;
});

// ---- Utility ----

function distanceInKm(fromLat, fromLng, toLat, toLng) {
  const R = 6371;
  const toRad = v => (v * Math.PI) / 180;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeText(v) {
  return String(v || "").trim().toLowerCase();
}

function estimateTravelSegment(from, to) {
  const d = distanceInKm(from.lat, from.lng, to.lat, to.lng);
  if (d <= 0.15) return { mode: "a piedi",  distanceKm: Math.round(d*10)/10, travelMinutes: 0 };
  if (d <= 1.5)  return { mode: "a piedi",  distanceKm: Math.round(d*10)/10, travelMinutes: Math.max(6, Math.round((d/4.5)*60)) };
  if (d <= 12)   return { mode: "in auto",  distanceKm: Math.round(d*10)/10, travelMinutes: Math.max(12, Math.round((d/28)*60)+6) };
  return           { mode: "in auto",  distanceKm: Math.round(d*10)/10, travelMinutes: Math.max(25, Math.round((d/50)*60)+10) };
}

function enrichStopsWithTravel(start, stops) {
  let prev = start;
  return stops.map((stop, i) => {
    const travel = estimateTravelSegment(prev, { lat: stop.coordinates.lat, lng: stop.coordinates.lng });
    prev = { lat: stop.coordinates.lat, lng: stop.coordinates.lng };
    return {
      ...stop,
      order: i + 1,
      imagePath: stop.imagePath || `images/pois/${stop.id}.jpg`,
      imageLabel: stop.imageLabel || stop.name,
      travelFromPrevious: {
        from: i === 0 ? start.label : stops[i-1].name,
        mode: travel.mode,
        distanceKm: travel.distanceKm,
        travelMinutes: travel.travelMinutes
      }
    };
  });
}

function normalizeStartLocation(rawValue) {
  const val = normalizeText(rawValue);
  const pois = state.pointsOfInterest;

  // Direct area match
  const byArea = pois.find(p => normalizeText(p.area) === val);
  if (byArea) return { label: byArea.area, lat: byArea.lat, lng: byArea.lng };

  // Partial area match
  const partial = pois.find(p => normalizeText(p.area).includes(val) || val.includes(normalizeText(p.area)));
  if (partial) return { label: partial.area, lat: partial.lat, lng: partial.lng };

  return { label: "Reggio Calabria", lat: 38.11106, lng: 15.64723 };
}

// ---- Fallback itinerary logic ----

function buildFallbackItinerary({ durationHours, start, includeFood, interests, pace }) {
  const pois = state.pointsOfInterest;
  const durationMinutes = Math.max(120, Math.min(720, durationHours * 60));
  const desiredTypes = new Set(interests.length ? interests : ["culture", "panorama"]);

  const ranked = pois
    .filter(p => includeFood || p.type !== "food")
    .map(p => {
      const dist = distanceInKm(start.lat, start.lng, p.lat, p.lng);
      const interestBoost = desiredTypes.has(p.type) ? 0 : 16;
      const localBoost = normalizeText(p.area) === normalizeText(start.label) ? -12 : 0;
      return { ...p, score: dist + interestBoost + localBoost };
    })
    .sort((a, b) => a.score - b.score);

  const selected = [];
  let remaining = durationMinutes;
  const maxStops = durationHours <= 4 ? 3 : durationHours <= 7 ? 4 : 5;

  for (const stop of ranked) {
    const pm = pace === "slow" ? 1.2 : pace === "fast" ? 0.85 : 1;
    const adjMin = Math.round(stop.visitMinutes * pm);
    const travel = estimateTravelSegment(
      selected.length ? selected[selected.length-1] : start,
      stop
    );
    const impact = adjMin + travel.travelMinutes;
    if (impact <= remaining) {
      selected.push({ ...stop, durationMinutes: adjMin, coordinates: { lat: stop.lat, lng: stop.lng } });
      remaining -= impact;
    }
    if (selected.length >= maxStops || remaining < 35) break;
  }

  if (includeFood && !selected.some(s => s.type === "food")) {
    const food = ranked.find(s => s.type === "food" && s.area === start.label) || ranked.find(s => s.type === "food");
    if (food) selected.push({ ...food, durationMinutes: food.foodMinutes || 60, coordinates: { lat: food.lat, lng: food.lng } });
  }

  const enriched = enrichStopsWithTravel(start, selected);
  const totalVisit  = enriched.reduce((s, x) => s + x.durationMinutes, 0);
  const totalTravel = enriched.reduce((s, x) => s + x.travelFromPrevious.travelMinutes, 0);

  return {
    source: "locale",
    title: `Itinerario ${durationHours} ore da ${start.label}`,
    summary: durationHours <= 3
      ? `Percorso compatto pensato per scoprire ${start.label} senza spostamenti troppo pesanti.`
      : `Itinerario bilanciato tra luoghi iconici, paesaggio e soste utili con partenza da ${start.label}.`,
    estimatedTotalMinutes: totalVisit + totalTravel,
    travelSummary: { totalTravelMinutes: totalTravel, totalVisitMinutes: totalVisit },
    practicalTips: [
      "I tempi di spostamento sono stimati e vanno verificati in base al traffico reale.",
      "Per borghi e centri storici conviene prevedere tratti a piedi con scarpe comode.",
      includeFood
        ? "Concentra la pausa food nella localita principale del percorso."
        : "Se resta tempo libero puoi aggiungere una sosta gastronomica locale."
    ],
    stops: enriched.map(s => ({
      order: s.order,
      id: s.id,
      name: s.name,
      area: s.area,
      type: s.type,
      durationMinutes: s.durationMinutes,
      coordinates: s.coordinates,
      description: s.description,
      why: s.type === "food"
        ? `Inserita per aggiungere una pausa gastronomica coerente con il percorso in area ${s.area}.`
        : `Scelta per la vicinanza a ${start.label} e per il valore ${s.categoryLabel.toLowerCase()}.`,
      imagePath: s.imagePath,
      imageLabel: s.imageLabel,
      travelFromPrevious: s.travelFromPrevious
    }))
  };
}

// ---- Claude API itinerary ----

async function buildClaudeItinerary({ durationHours, start, includeFood, interests, pace, apiKey }) {
  const pois = state.pointsOfInterest;
  const prompt = `Sei un assistente turistico esperto della provincia di Reggio Calabria e delle localita vicine.

Usa SOLO i punti di interesse presenti in questo dataset JSON:
${JSON.stringify(pois)}

Vincoli dell'utente:
- Durata in ore: ${durationHours}
- Posizione iniziale: ${start.label}
- Vuole mangiare: ${includeFood ? "si" : "no"}
- Ritmo: ${pace}
- Interessi: ${interests.join(", ") || "culture, panorama"}

Regole importanti:
- Non inventare tappe fuori dal dataset
- Preferisci luoghi coerenti con la localita iniziale
- Non calcolare i tempi di spostamento (li calcola il sistema)
- Restituisci SOLO JSON valido, nessun testo extra, nessun markdown

Formato richiesto:
{
  "title": "string",
  "summary": "string",
  "stops": [
    {
      "id": "string (id esatto dal dataset)",
      "name": "string",
      "durationMinutes": number,
      "description": "string",
      "why": "string"
    }
  ],
  "practicalTips": ["string", "string", "string"]
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content.map(b => b.text || "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  const raw = JSON.parse(clean);

  // Sanitize: match stops to real POIs
  const hydratedStops = (raw.stops || []).map(s => {
    const match = pois.find(p => p.id === s.id) || pois.find(p => normalizeText(p.name) === normalizeText(s.name));
    if (!match) return null;
    return {
      id: match.id,
      name: match.name,
      area: match.area,
      type: match.type,
      durationMinutes: Number(s.durationMinutes) || match.visitMinutes,
      coordinates: { lat: match.lat, lng: match.lng },
      description: s.description || match.description,
      why: s.why || `Tappa selezionata da Claude.`,
      imagePath: match.imagePath,
      imageLabel: match.imageLabel
    };
  }).filter(Boolean);

  const enriched = enrichStopsWithTravel(start, hydratedStops);
  const totalVisit  = enriched.reduce((s, x) => s + x.durationMinutes, 0);
  const totalTravel = enriched.reduce((s, x) => s + x.travelFromPrevious.travelMinutes, 0);

  return {
    source: "claude",
    title: raw.title || `Itinerario personalizzato da ${start.label}`,
    summary: raw.summary || `Percorso costruito con Claude a partire da ${start.label}.`,
    estimatedTotalMinutes: totalVisit + totalTravel,
    travelSummary: { totalTravelMinutes: totalTravel, totalVisitMinutes: totalVisit },
    practicalTips: Array.isArray(raw.practicalTips) && raw.practicalTips.length
      ? raw.practicalTips
      : ["Controlla sempre traffico e aperture dei luoghi prima di partire."],
    stops: enriched
  };
}

// ---- Map ----

function createIcon(color) {
  return L.divIcon({
    className: "custom-marker",
    html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.2)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -8]
  });
}

function renderLegend() {
  legend.innerHTML = Object.values(categoryStyles)
    .map(v => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${v.color}"></span>
        <span>${v.label}</span>
      </div>`)
    .join("");
}

function renderMap(pois) {
  state.map = L.map("map", { zoomControl: false }).setView([38.18, 15.88], 10);
  L.control.zoom({ position: "bottomright" }).addTo(state.map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(state.map);

  pois.forEach(poi => {
    const style = categoryStyles[poi.type] || categoryStyles.culture;
    const marker = L.marker([poi.lat, poi.lng], { icon: createIcon(style.color) }).addTo(state.map);
    marker.bindPopup(`
      <div style="min-width:160px">
        <strong>${poi.name}</strong><br/>
        <span style="color:#5d6b78;font-size:0.88rem">${poi.area} · ${poi.categoryLabel}</span><br/>
        <small style="color:#5d6b78">${poi.description}</small><br/>
        <a href="luogo.html?id=${poi.id}" style="display:inline-block;margin-top:8px;padding:6px 12px;border-radius:999px;background:#073b52;color:white;text-decoration:none;font-size:0.82rem;font-weight:600">
          Scopri questo luogo →
        </a>
      </div>
    `);
  });

  const bounds = L.latLngBounds(pois.map(p => [p.lat, p.lng]));
  state.map.fitBounds(bounds.pad(0.15));
}

// ---- Itinerary render ----

function renderItinerary(start, itinerary) {
  const stopsMarkup = itinerary.stops.map(stop => `
    <article class="stop-card">
      <div class="stop-image-shell">
        <img
          src="${stop.imagePath}"
          alt="${stop.imageLabel}"
          class="stop-image"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
        />
        <div class="image-placeholder" style="display:none">
          <span>Inserisci immagine</span>
          <small>${stop.imagePath.replace("images/pois/", "")}</small>
        </div>
      </div>
      <div class="stop-number">${stop.order}</div>
      <h4>${stop.name}</h4>
      <div class="stop-meta">
        <span>${stop.area}</span>
        <span>${categoryStyles[stop.type]?.label || stop.type}</span>
        <span>${stop.durationMinutes} min</span>
      </div>
      <div class="travel-meta">
        <span>Da ${stop.travelFromPrevious.from}</span>
        <span>${stop.travelFromPrevious.mode}</span>
        <span>${stop.travelFromPrevious.distanceKm} km</span>
        <span>${stop.travelFromPrevious.travelMinutes} min</span>
      </div>
      <p>${stop.description}</p>
      <p><strong>Perche qui:</strong> ${stop.why}</p>
    </article>
  `).join("");

  const tipsMarkup = itinerary.practicalTips.map(t => `<li>${t}</li>`).join("");

  output.innerHTML = `
    <div class="itinerary-card">
      <h3>${itinerary.title}</h3>
      <p class="itinerary-summary">${itinerary.summary}</p>
      <div class="itinerary-meta">
        <span class="pill">Partenza: ${start.label}</span>
        <span class="pill">Durata stimata: ${itinerary.estimatedTotalMinutes} min</span>
        <span class="pill">Spostamenti: ${itinerary.travelSummary.totalTravelMinutes} min</span>
        <span class="pill">Visite: ${itinerary.travelSummary.totalVisitMinutes} min</span>
        <span class="pill">${itinerary.stops.length} tappe</span>
      </div>
      <div class="stops-grid">${stopsMarkup}</div>
      <h4>Consigli pratici</h4>
      <ul class="tip-list">${tipsMarkup}</ul>
    </div>
  `;

  if (state.map && itinerary.stops.length) {
    const bounds = L.latLngBounds(itinerary.stops.map(s => [s.coordinates.lat, s.coordinates.lng]));
    state.map.fitBounds(bounds.pad(0.25));
  }
}

// ---- Form submit ----

plannerForm.addEventListener("submit", async event => {
  event.preventDefault();

  const fd = new FormData(plannerForm);
  const btn = plannerForm.querySelector("button[type='submit']");
  const interests = fd.getAll("interests");
  const apiKey = document.getElementById("apiKey").value.trim();

  btn.disabled = true;
  btn.textContent = "Creazione in corso...";
  sourceNote.textContent = "Sto calcolando il percorso migliore per te";

  const start = normalizeStartLocation(fd.get("startLocation"));
  const params = {
    durationHours: Number(fd.get("durationHours")),
    startLocation: fd.get("startLocation"),
    pace: fd.get("pace"),
    includeFood: fd.get("includeFood") === "on",
    interests,
    start,
    apiKey
  };

  try {
    let itinerary;

    if (apiKey) {
      try {
        itinerary = await buildClaudeItinerary(params);
        sourceNote.textContent = "Itinerario generato con Claude AI";
      } catch (err) {
        console.warn("Claude API failed, usando fallback:", err.message);
        itinerary = buildFallbackItinerary(params);
        sourceNote.textContent = "Itinerario creato con logica locale (errore API)";
      }
    } else {
      itinerary = buildFallbackItinerary(params);
      sourceNote.textContent = "Itinerario creato con logica locale";
    }

    renderItinerary(start, itinerary);
  } catch (err) {
    output.innerHTML = `
      <div class="empty-state">
        <h3>Qualcosa e andato storto.</h3>
        <p>Non sono riuscito a generare l'itinerario adesso. Riprova tra poco.</p>
      </div>
    `;
    sourceNote.textContent = "Errore di generazione";
  } finally {
    btn.disabled = false;
    btn.textContent = "Genera itinerario";
  }
});

// ---- Init ----

function initMap() {
  state.pointsOfInterest = POIS_DATA;
  poiCount.textContent = `${POIS_DATA.length} punti caricati`;
  renderLegend();
  renderMap(POIS_DATA);
}

initMap();
