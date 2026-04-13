// =====================================================
// CALABRIA EXPLORER — luogo.js
// Pagina dettaglio di un punto di interesse.
// La descrizione AI usa l'API Anthropic se viene
// fornita una chiave, altrimenti usa il fallback locale.
// =====================================================

const categoryStyles = {
  culture:  { label: "Cultura",   color: "#cf5c36" },
  panorama: { label: "Panorama",  color: "#0f6e8c" },
  nature:   { label: "Relax",     color: "#5b8c5a" },
  food:     { label: "Food",      color: "#f29f05" }
};

function getPoiId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderPoiInfo(poi) {
  const style = categoryStyles[poi.type] || categoryStyles.culture;
  document.title = `${poi.name} – Calabria Explorer`;

  const heroImg = document.getElementById("hero-image");
  heroImg.src = poi.imagePath;
  heroImg.alt = poi.imageLabel || poi.name;

  document.getElementById("hero-placeholder-label").textContent = poi.imageLabel || poi.name;
  document.getElementById("badge-area").textContent = poi.area;
  document.getElementById("badge-type").textContent = style.label;
  document.getElementById("badge-duration").textContent = `${poi.visitMinutes} min di visita`;
  document.getElementById("luogo-title").textContent = poi.name;
  document.getElementById("luogo-description").textContent = poi.description;
}

function buildFallbackDescription(poi) {
  return {
    intro: `${poi.name} si trova a ${poi.area}, nella provincia di Reggio Calabria. ${poi.description}\n\nQuesta tappa e classificata come "${poi.categoryLabel}" e richiede circa ${poi.visitMinutes} minuti per essere visitata al meglio.`,
    cards: [
      { icon: "📍", title: "Dove si trova", text: `${poi.name} e situato nel comune di ${poi.area}, in Calabria.` },
      { icon: "🕐", title: "Tempo consigliato", text: `Per visitare questo luogo si consiglia di riservare almeno ${poi.visitMinutes} minuti.` },
      { icon: "🏷️", title: "Categoria", text: poi.categoryLabel }
    ],
    tips: [
      "Verifica gli orari di apertura prima di partire.",
      "Indossa scarpe comode se il luogo prevede percorsi a piedi.",
      "La luce migliore per le foto e al mattino presto o prima del tramonto."
    ]
  };
}

async function buildClaudeDescription(poi, apiKey) {
  const prompt = `Sei una guida turistica esperta della Calabria e in particolare della provincia di Reggio Calabria.

Descrivi il luogo con questi dati:
- Nome: ${poi.name}
- Area: ${poi.area}
- Categoria: ${poi.categoryLabel}
- Descrizione breve: ${poi.description}
- Durata visita consigliata: ${poi.visitMinutes} minuti

Restituisci SOLO JSON valido, senza markdown, senza backtick. Formato:
{
  "intro": "Due o tre paragrafi separati da \\n che raccontano il luogo in modo evocativo e informativo. Parla di storia, atmosfera, cosa vedere.",
  "cards": [
    { "icon": "🏛️", "title": "Storia", "text": "Breve storia del luogo in 2-3 frasi." },
    { "icon": "👁️", "title": "Cosa vedere", "text": "Le cose principali da non perdere." },
    { "icon": "📸", "title": "Per i fotografi", "text": "Consigli fotografici specifici per questo posto." },
    { "icon": "🚶", "title": "Come arrivarci", "text": "Come raggiungere il luogo." }
  ],
  "tips": ["Consiglio pratico 1", "Consiglio pratico 2", "Consiglio pratico 3"]
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
      max_tokens: 1500,
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
  return JSON.parse(clean);
}

function renderAiDescription(data) {
  const aiLoading = document.getElementById("ai-loading");
  const aiContent = document.getElementById("ai-content");
  const aiError   = document.getElementById("ai-error");

  aiLoading.style.display = "none";
  aiError.style.display   = "none";
  aiContent.style.display = "flex";

  // Intro paragraphs
  const introEl = document.getElementById("ai-intro");
  if (data.intro) {
    introEl.innerHTML = data.intro
      .split("\n")
      .filter(p => p.trim())
      .map(p => `<p>${p}</p>`)
      .join("");
  }

  // Cards
  const gridEl = document.getElementById("ai-grid");
  if (Array.isArray(data.cards) && data.cards.length) {
    gridEl.innerHTML = data.cards.map(card => `
      <div class="ai-card">
        <div class="ai-card-icon">${card.icon}</div>
        <h4>${card.title}</h4>
        <p>${card.text}</p>
      </div>
    `).join("");
  } else {
    gridEl.style.display = "none";
  }

  // Tips
  const tipsEl = document.getElementById("ai-tips");
  if (Array.isArray(data.tips) && data.tips.length) {
    tipsEl.innerHTML = `
      <h4>Consigli pratici</h4>
      <ul>${data.tips.map(t => `<li>${t}</li>`).join("")}</ul>
    `;
  } else {
    tipsEl.style.display = "none";
  }
}

async function loadDescription(poi) {
  const apiKey = document.getElementById("luogo-api-key").value.trim();
  const sourceNote = document.getElementById("ai-source-note");
  const aiLoading  = document.getElementById("ai-loading");
  const aiContent  = document.getElementById("ai-content");
  const aiError    = document.getElementById("ai-error");
  const btn        = document.getElementById("gen-description-btn");

  aiLoading.style.display = "flex";
  aiContent.style.display = "none";
  aiError.style.display   = "none";
  sourceNote.textContent  = "Generazione in corso...";
  if (btn) { btn.disabled = true; btn.textContent = "Generazione..."; }

  try {
    let data;
    if (apiKey) {
      data = await buildClaudeDescription(poi, apiKey);
      sourceNote.textContent = "Descrizione generata con Claude";
    } else {
      data = buildFallbackDescription(poi);
      sourceNote.textContent = "Descrizione locale (aggiungi chiave API per la versione AI)";
    }
    renderAiDescription(data);
  } catch (err) {
    console.error("Description failed:", err);
    aiLoading.style.display = "none";
    aiError.style.display   = "block";
    sourceNote.textContent  = "Errore — usa la descrizione locale";
    // fallback gracefully
    const fallback = buildFallbackDescription(poi);
    renderAiDescription(fallback);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Genera descrizione"; }
  }
}

async function init() {
  const id = getPoiId();

  if (!id) {
    window.location.href = "index.html";
    return;
  }

  const poi = POIS_DATA.find(p => p.id === id);

  if (!poi) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("loading-state").style.display = "none";
  document.getElementById("luogo-content").style.display = "block";

  renderPoiInfo(poi);

  // Load fallback description immediately
  await loadDescription(poi);

  // Button for re-generation with API key
  const btn = document.getElementById("gen-description-btn");
  if (btn) {
    btn.addEventListener("click", () => loadDescription(poi));
  }
}

init();
