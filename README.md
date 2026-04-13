# Calabria Explorer — Versione statica HTML/CSS/JS

Sito completamente statico, nessun server necessario.
Apri `index.html` nel browser per iniziare.

## Struttura file

```
calabria-explorer/
├── index.html          → Homepage con mappa e planner itinerario
├── luogo.html          → Pagina dettaglio di un punto di interesse
├── admin.html          → Pannello di gestione POI
├── styles.css          → Stili condivisi (mappa, planner, itinerario)
├── luogo.css           → Stili pagina luogo
├── admin.css           → Stili pannello admin
├── app.js              → Logica mappa, planner, generazione itinerario
├── luogo.js            → Logica pagina dettaglio luogo
├── admin.js            → Logica pannello admin (CRUD + localStorage)
├── pois.js             → Dataset dei punti di interesse
└── images/
    └── pois/           → Inserisci qui le immagini dei luoghi
                          Es: scilla-castello.jpg, tropea-centro.jpg
```

## Funzionalità

### Mappa interattiva
- Mostra tutti i 23 punti di interesse su OpenStreetMap
- Marker colorati per categoria (Cultura, Panorama, Relax, Food)
- Popup con link alla pagina dettaglio del luogo

### Planner itinerario
- Funziona senza API key con logica locale
- Con chiave API Anthropic usa Claude per itinerari personalizzati
- Inserisci la chiave nel campo apposito sul sito

### Pagina dettaglio luogo
- Mostra info base sempre (da pois.js)
- Con chiave API Anthropic genera descrizione AI con Claude
- Clicca "Genera descrizione" dopo aver inserito la chiave

### Pannello Admin
- Aggiungi, modifica ed elimina POI
- I dati vengono salvati in localStorage del browser
- Usa "Esporta pois.js" per rendere le modifiche permanenti
  (sostituisci il file pois.js nella cartella)

## Immagini

Inserisci le immagini in `images/pois/` con i nomi corrispondenti:
- reggio-lungomare.jpg
- reggio-museo.jpg
- scilla-castello.jpg
- tropea-centro.jpg
- pentedattilo-borgo.jpg
- ... (vedi pois.js per tutti i nomi)

Se un'immagine manca, viene mostrato un placeholder con il nome del file.

## API Anthropic (opzionale)

Per abilitare la generazione AI:
1. Ottieni una chiave API su https://console.anthropic.com
2. Inseriscila nel campo "Chiave API Anthropic" sul sito
La chiave non viene mai salvata né inviata a terzi.

## Come usare in locale con server

Se il browser blocca le richieste API per CORS, usa un server locale:

```bash
# Python
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

Poi apri http://localhost:8080
