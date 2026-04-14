// =====================================================
// CALABRIA EXPLORER — luogo.js  (v3)
// - Descrizioni storiche statiche per ogni POI
// - Nessuna chiave API richiesta per le descrizioni
// - Chat AI attiva su richiesta (chiave modal)
// - Mappa con percorso reale via OSRM
// =====================================================

const categoryStyles = {
  culture:  { label: "Cultura",   color: "#cf5c36" },
  panorama: { label: "Panorama",  color: "#0f6e8c" },
  nature:   { label: "Relax",     color: "#5b8c5a" },
  food:     { label: "Food",      color: "#f29f05" }
};

function getApiKey() { return localStorage.getItem("calabria_anthropic_key") || ""; }
function saveApiKey(key) { if (key) localStorage.setItem("calabria_anthropic_key", key); }
function getPoiId() { return new URLSearchParams(window.location.search).get("id"); }

function openLightbox(src, alt) {
  let lb = document.getElementById("lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.id = "lightbox";
    lb.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:20px;";
    lb.innerHTML = `<img id="lightbox-img" style="max-width:100%;max-height:90vh;border-radius:12px;object-fit:contain;" />`;
    lb.addEventListener("click", () => { lb.style.display = "none"; });
    document.body.appendChild(lb);
  }
  lb.querySelector("#lightbox-img").src = src;
  lb.querySelector("#lightbox-img").alt = alt;
  lb.style.display = "flex";
}

// =====================================================
// STORIE STORICHE STATICHE
// =====================================================
const POI_STORIES = {
  "reggio-lungomare": {
    intro: `Il Lungomare Falcomatà di Reggio Calabria è considerato tra i più belli d'Europa. Si estende per circa tre chilometri lungo lo Stretto di Messina, regalando uno degli affacci più emozionanti del Mediterraneo: nelle giornate limpide la Sicilia sembra a portata di mano, con l'Etna innevata sullo sfondo.\n\nIntitolato ad Italo Falcomatà, sindaco che negli anni '90 guidò la rinascita civile della città, il lungomare custodisce due copie fedeli dei Bronzi di Riace nelle aiuole centrali. La passeggiata è costellata di palme, buganvillee e monumenti storici ed è il cuore pulsante della vita sociale reggina.`,
    cards: [
      { icon: "🌊", title: "Lo Stretto", text: "Il punto più stretto dello Stretto di Messina misura poco più di 3 km. Da qui si osserva uno dei passaggi marittimi più trafficati del Mediterraneo." },
      { icon: "🗿", title: "I Bronzi (copie)", text: "Due copie fedeli dei Bronzi di Riace ornano il lungomare. Gli originali, del V sec. a.C., sono conservati nel Museo Nazionale a pochi passi." },
      { icon: "🌺", title: "Il giardino", text: "La vegetazione subtropicale — palme canarie, ficus, buganvillee — trasforma il lungomare in un giardino mediterraneo unico nel suo genere." },
      { icon: "🌅", title: "Orari ideali", text: "All'alba e al tramonto la luce sullo Stretto è straordinaria. La sera il lungomare si anima di passeggiatori e diventa il salotto all'aperto della città." }
    ],
    tips: ["Portati una fotocamera al tramonto: i colori sull'Etna sono indimenticabili.", "Bar e gelaterie lungo il percorso offrono granite tipiche reggine.", "Dal lungomare si parte per il traghetto per Messina."]
  },
  "reggio-museo": {
    intro: `Il Museo Archeologico Nazionale di Reggio Calabria è uno dei più importanti musei dell'antichità classica in Italia. Custodisce i Bronzi di Riace, due straordinarie statue greche di bronzo del V secolo a.C., scoperte nel 1972 dai fondali del Mar Ionio e considerate tra i capolavori assoluti della scultura mondiale.\n\nIl museo, radicalmente ristrutturato e riaperto nel 2016, ospita collezioni che documentano oltre tremila anni di storia calabrese: dalla preistoria alla Magna Grecia, dai Romani ai Bizantini.`,
    cards: [
      { icon: "🏆", title: "I Bronzi di Riace", text: "Statue di bronzo a grandezza naturale raffiguranti due guerrieri, databili al 460–430 a.C. Tra le opere greche originali meglio conservate al mondo." },
      { icon: "⚓", title: "Il ritrovamento", text: "Individuati nel 1972 dal subacqueo Stefano Mariottini a 8 m di profondità. Il restauro rivelò dettagli straordinari: denti d'argento, labbra e capezzoli in rame." },
      { icon: "🏛️", title: "Le collezioni", text: "Oltre ai Bronzi: la Testa del filosofo di Porticello, monete magno-greche, i pinakes di Locri e reperti preistorici delle comunità calabresi." },
      { icon: "📐", title: "L'architettura", text: "La sede, progettata da Piacentini negli anni '30 e riqualificata nel 2016, sviluppa i percorsi su più livelli con illuminazione scenografica." }
    ],
    tips: ["Prenota online per evitare code, soprattutto in estate.", "Calcola almeno 2 ore per vedere l'intero museo con calma.", "Il bookshop ha ottime pubblicazioni sui Bronzi e sulla Magna Grecia."]
  },
  "reggio-castello": {
    intro: `Il Castello Aragonese di Reggio Calabria sorge nel punto più meridionale della città, affacciato sullo Stretto di Messina. Le origini risalgono all'epoca normanna (XI secolo), ma l'aspetto attuale — con le possenti torri cilindriche angolari — fu definito dagli Aragonesi nel XV secolo, quando la Calabria faceva parte del Regno di Napoli.\n\nNel corso dei secoli la fortezza fu usata come caserma, prigione e deposito. I terremoti del 1783 e del catastrofico 1908 ne compromisero parti significative. Oggi ospita il Museo del Castello e offre dalla sommità una vista privilegiata sullo Stretto.`,
    cards: [
      { icon: "🏰", title: "Architettura", text: "Pianta trapezoidale con quattro torri cilindriche angolari. Le mura in pietra locale raggiungono i 4 metri di spessore nelle sezioni originali." },
      { icon: "⚔️", title: "Storia militare", text: "Fu presidio strategico per il controllo dello Stretto. Aragonesi, Spagnoli e Borboni si alternarono nella gestione della fortezza per oltre quattro secoli." },
      { icon: "🌋", title: "Il 1908", text: "Il terremoto del 28 dicembre 1908 colpì duramente Reggio. Il castello resistette parzialmente e fungé da punto di raccolta per i sopravvissuti." },
      { icon: "🔭", title: "La vista", text: "Dalla terrazza si domina l'intero Stretto: Messina, Capo Peloro e l'inizio della Sicilia, fino all'Etna nelle giornate terse." }
    ],
    tips: ["Visita la terrazza prima del tramonto.", "Il museo interno espone reperti medievali e mappe storiche dello Stretto.", "Nei pressi ci sono i resti dell'antico teatro greco-romano."]
  },
  "scilla-castello": {
    intro: `Il Castello Ruffo di Scilla domina il promontorio roccioso che separa la spiaggia di Chianalea da quella di San Giorgio. Le prime strutture difensive risalgono al VI secolo, ma il castello assunse la sua forma definitiva nel XII-XIII secolo sotto la famiglia Ruffo, potente casata calabrese.\n\nLa fortezza è intimamente legata al mito di Scilla, il mostro marino citato da Omero nell'Odissea. La leggenda vuole che abitasse proprio questa rupe per divorare i marinai che transitavano nello Stretto. Oggi il castello ospita un ostello della gioventù e il Faro di Scilla.`,
    cards: [
      { icon: "🌊", title: "Il mito di Scilla", text: "Omero nell'Odissea (XII libro) colloca Scilla su questa roccia, contrapposta a Cariddi sul lato siciliano. Ulisse perse sei compagni nel tentativo di attraversare lo stretto." },
      { icon: "🏰", title: "I Ruffo", text: "La famiglia Ruffo ottenne il feudo di Scilla nel XIII secolo e lo tenne per oltre 200 anni, trasformando la fortezza in residenza nobiliare oltre che difensiva." },
      { icon: "⚡", title: "Il terremoto del 1783", text: "La catastrofe del 5 febbraio 1783 distrusse gran parte di Scilla. Una frana trascinò in mare centinaia di persone rifugiate sulla spiaggia; si stimano oltre 1.500 vittime." },
      { icon: "💡", title: "Il faro", text: "Il faro attivo sul promontorio è uno dei punti di riferimento per la navigazione nello Stretto di Messina." }
    ],
    tips: ["Sali alle terrazze per la vista su entrambe le spiagge e la Sicilia.", "La visita si combina con una passeggiata a Chianalea.", "In luglio-agosto la spiaggia sotto il castello è affollatissima: meglio al mattino."]
  },
  "scilla-chianalea": {
    intro: `Chianalea è il quartiere marinaro di Scilla, considerato tra i borghi più belli d'Italia. Si sviluppa su una lingua di terra così stretta che le case sembrano costruite sull'acqua stessa: i vicoli sono spesso larghi appena un metro e le imbarcazioni vengono ormeggiate direttamente sotto le finestre.\n\nLe case colorate dei pescatori, i profumi di pesce fresco e bergamotto, i gatti che sonnecchiano sulle barche fanno di Chianalea una delle esperienze visive più autentiche della Calabria.`,
    cards: [
      { icon: "🐟", title: "La pesca del pesce spada", text: "Scilla è uno dei centri storici della pesca al pesce spada. Le barche con la lunga passerella (l'antenna) sono ancora in uso e si vedono nel porto." },
      { icon: "🏘️", title: "Case sull'acqua", text: "Molte abitazioni hanno la porta sul mare: al piano terra il deposito delle barche, ai piani superiori la vita familiare." },
      { icon: "🌅", title: "La luce", text: "Il borgo è esposto sia a est che a ovest: l'alba illumina il lato dello Stretto, il tramonto tinge di arancio le facciate verso il Tirreno." },
      { icon: "🍽️", title: "Gastronomia", text: "I ristoranti servono pesce freschissimo: la 'ghiotta' di pesce spada, le alici marinate, i totani ripieni e i ricci di mare sono i piatti della tradizione." }
    ],
    tips: ["Visita il borgo nelle prime ore del mattino per atmosfera e fotografie migliori.", "Alcuni ristoranti hanno i tavoli direttamente sull'acqua: prenota in anticipo d'estate.", "Passeggia anche oltre il borgo verso nord per trovare calette più tranquille."]
  },
  "scilla-belvedere": {
    intro: `Il Belvedere di Piazza San Rocco è il punto panoramico più accessibile di Scilla, raggiungibile a piedi dal centro in pochi minuti. Offre una vista a 180 gradi che abbraccia contemporaneamente il Castello Ruffo, il borgo di Chianalea, la spiaggia di San Giorgio e, sullo sfondo, la costa siciliana con l'Etna.\n\nLa piazza prende il nome dalla chiesa di San Rocco, costruita nel XVIII secolo come ex-voto dopo una pestilenza. È il luogo preferito dai fotografi al tramonto e dai locali per la passeggiata serale.`,
    cards: [
      { icon: "📸", title: "Il punto fotografico", text: "Da qui si cattura l'immagine iconica di Scilla: il castello sulla roccia, Chianalea ai suoi piedi e la Sicilia sullo sfondo." },
      { icon: "⛪", title: "La chiesa", text: "La chiesa di San Rocco (XVIII sec.) conserva una statua lignea del Santo venerata dai pescatori del borgo." },
      { icon: "🌬️", title: "Il vento", text: "Il belvedere è esposto alla tramontana e al maestrale: nelle giornate ventose le raffiche dal mare creano un'esperienza sensoriale unica." },
      { icon: "🌇", title: "Il tramonto", text: "Nelle sere d'estate il tramonto colora di rosso sia il castello sia la cresta dell'Etna. Il momento dura pochi minuti ma è memorabile." }
    ],
    tips: ["Raggiungi il belvedere a piedi: il percorso è breve e panoramico.", "Porta una giacca anche d'estate: il vento dal mare può essere intenso.", "È il punto di partenza ideale per esplorare sia il castello che Chianalea."]
  },
  "tropea-centro": {
    intro: `Il centro storico di Tropea è uno dei borghi medievali più affascinanti d'Italia, arroccato su una rupe di tufo che precipita verticalmente sul Tirreno. Il tessuto urbano è rimasto straordinariamente intatto: vicoli lastricati, palazzi nobiliari barocchi, chiese normanne e loggiati con scorci sul mare.\n\nTropea fu fondata — secondo la leggenda — da Ercole di ritorno dalle sue fatiche. La città è famosa in tutto il mondo per la cipolla rossa di Tropea, Presidio Slow Food, e per le sue spiagge di sabbia bianca con acque turchesi.`,
    cards: [
      { icon: "🏛️", title: "Il Duomo normanno", text: "La Cattedrale dell'Assunta, fondata dai Normanni nell'XI secolo, conserva all'ingresso due bombe americane inesplose della Seconda Guerra Mondiale, esposte come ex-voto." },
      { icon: "🧅", title: "La cipolla rossa", text: "La cipolla rossa di Tropea DOP è dolcissima e poco acre. Si usa cruda, in marmellata, nella 'nduja e nella famosa pitta 'mpigliata." },
      { icon: "🏰", title: "I palazzi nobiliari", text: "Il corso è fiancheggiato da palazzi del XVI-XVIII secolo con stemmi nobiliari, balconi in ferro battuto e portali barocchi in pietra arenaria." },
      { icon: "⚓", title: "Il porto storico", text: "Il porto di Tropea fu scalo commerciale cruciale nel Medioevo per i traffici tra il Tirreno e lo Stretto." }
    ],
    tips: ["Visita il Duomo e scendi sulla spiaggia della Rotonda per l'angolo fotografico classico.", "Il mercato della cipolla rossa si tiene in piazza Ercole nei mesi estivi.", "Percorri le mura perimetrali del borgo per gli affacci più suggestivi sul mare."]
  },
  "tropea-santamaria": {
    intro: `Il santuario di Santa Maria dell'Isola è l'immagine simbolo di Tropea nel mondo: una chiesa medievale costruita sulla sommità di un faraglione di tufo che si protende nel Mar Tirreno, collegata alla città da una scalinata scavata nella roccia viva.\n\nL'edificio originario risale all'XI-XII secolo; l'attuale struttura barocca fu eretta nel XVIII secolo. La chiesa è ancora luogo di culto attivo e meta di pellegrinaggi: la Madonna dell'Isola è la patrona dei marinai di Tropea.`,
    cards: [
      { icon: "⛪", title: "Il santuario", text: "L'interno conserva un'icona della Madonna attribuita alla tradizione a San Luca Evangelista, giunta secondo la leggenda su una barca senza equipaggio." },
      { icon: "🪨", title: "La roccia di tufo", text: "Il faraglione è composto di tufo calcareo, la stessa roccia dell'intero centro storico di Tropea. L'erosione marina ha modellato nei secoli la sua forma." },
      { icon: "🌊", title: "La Costa degli Dei", text: "Il tratto di costa tra Tropea e Capo Vaticano prende il nome di Costa degli Dei. Da Santa Maria dell'Isola se ne apprezza l'intera estensione." },
      { icon: "📸", title: "Il punto migliore", text: "Il belvedere a ovest del santuario offre la vista frontale della chiesa sul mare. Per la foto con la città sullo sfondo, usa il belvedere a est." }
    ],
    tips: ["La scalinata di accesso è ripida: porta scarpe comode.", "L'ingresso alla chiesa è gratuito; rispetta il silenzio e il codice di abbigliamento.", "Scendi sulla spiaggia sotto il santuario per la vista dal basso."]
  },
  "tropea-marina": {
    intro: `L'affaccio sul mare di Tropea offre uno degli scenari costieri più celebri d'Italia. Le scogliere di tufo arancione precipitano sul mare turchese, creando contrasti cromatici straordinari. Le spiagge ai piedi delle rupi sono famose in tutta Europa per la qualità delle acque e la sabbia fine.\n\nLa costa sotto il centro storico è articolata in diverse calette: la spiaggia della Rotonda, la più fotografata con il santuario sullo sfondo, la spiaggia del Porto e numerose insenature minori raggiungibili solo via mare.`,
    cards: [
      { icon: "🏖️", title: "Le spiagge", text: "La spiaggia della Rotonda è la più famosa. Per più tranquillità cerca le calette a nord del porto, raggiungibili solo a piedi lungo il sentiero costiero." },
      { icon: "🤿", title: "Il mare", text: "Fondali sabbiosi che degradano lentamente: ideali per bambini e snorkeling. La posidonia protegge la trasparenza dell'acqua." },
      { icon: "🌅", title: "Tramonto", text: "Il sole tramonta direttamente sul Tirreno: l'affaccio sul mare di Tropea nelle sere estive è uno spettacolo di colori che va dal rosa al rosso intenso." },
      { icon: "🚡", title: "Ascensore", text: "Un ascensore pubblico scende dal centro storico alla spiaggia principale: comodo per non dover affrontare la salita con attrezzatura da mare." }
    ],
    tips: ["In luglio-agosto le spiagge principali sono molto affollate: arriva presto o scegli le calette minori.", "Il kayak è il modo migliore per esplorare le insenature inaccessibili a piedi.", "Il centro sub organizza immersioni nelle secche vicine, ricche di fauna marina."]
  },
  "pentedattilo-borgo": {
    intro: `Pentedattilo è uno dei borghi abbandonati più suggestivi d'Europa. Il nome deriva dal greco "pente daktyloi" — cinque dita — per la forma della roccia calcarea che sovrasta il paese, modellata dall'erosione a forma di mano aperta. Il borgo sorge letteralmente sulla roccia, con case costruite nelle fessure e nei recessi della parete.\n\nLa storia di Pentedattilo è segnata dalla "Strage degli Alberti" del 1686: Bernardino Abenavoli massacrò l'intera famiglia del marchese Alberti per vendicarsi di un matrimonio negato. Il terremoto del 1783 danneggiò gravemente il borgo; la definitiva migrazione degli abitanti verso la marina avvenne nel Novecento.`,
    cards: [
      { icon: "🖐️", title: "La roccia delle cinque dita", text: "La pinnacolo calcarea sopra il paese è visibile a chilometri di distanza. La forma a mano aperta è il risultato di millenni di erosione eolica e delle piogge." },
      { icon: "🩸", title: "La strage degli Alberti", text: "Nel 1686 Bernardino Abenavoli irruppe uccidendo i maschi della famiglia Alberti. Si salvò solo la figlia Antonia, promessa sposa che il marchese aveva rifiutato di concedere." },
      { icon: "🏚️", title: "L'abbandono", text: "Dopo il 1783 la popolazione iniziò a spostarsi verso la marina. Negli anni '50-'60 gli ultimi abitanti lasciarono definitivamente il borgo." },
      { icon: "🔨", title: "Il recupero", text: "Dal 1981 Legambiente porta ogni estate volontari internazionali per restaurare chiese, mura e vicoli. Alcune strutture ospitano mostre e residenze artistiche." }
    ],
    tips: ["Strade sterrate e irregolari: scarpe da trekking obbligatorie.", "Una guida locale arricchisce enormemente la visita con storie e leggende.", "In agosto il campo di volontariato internazionale anima il borgo."]
  },
  "ammendolea-borgo": {
    intro: `Il borgo medievale di Amendolea si arrampica su uno sperone roccioso che domina la fiumara omonima, uno dei più caratteristici corsi d'acqua stagionali dell'Aspromonte. Abbandonato dopo i danni del terremoto del 1908, conserva intatto il suo impianto medievale: resti del castello normanno, la chiesa matrice e i vicoli deserti.\n\nAmendolea fa parte della Bovesia, la terra abitata dalla comunità grecanica — i discendenti delle antiche colonie greco-bizantine che per secoli hanno mantenuto vivo il griko, dialetto neogreco ancora parlato da alcune centinaia di anziani.`,
    cards: [
      { icon: "🏰", title: "Il castello normanno", text: "I resti del castello (XI-XII sec.) occupano la sommità dello sperone. Dalla cima si domina l'intera vallata della fiumara Amendolea." },
      { icon: "🌊", title: "La fiumara", text: "La fiumara Amendolea è tipica dell'Aspromonte: quasi asciutta d'estate, in autunno-inverno si trasforma in un torrente impetuoso." },
      { icon: "🗣️", title: "Il griko", text: "L'area fa parte dei comuni grecanici dove sopravvive il griko, lingua neogreca testimonianza della presenza greco-bizantina in Calabria fino al XIII-XIV secolo." },
      { icon: "🫒", title: "L'oliveto storico", text: "Attorno al borgo ci sono oliveti con piante pluricentenarie, dai tronchi contorti e cavi che testimoniano secoli di coltivazione continua." }
    ],
    tips: ["La strada di accesso è stretta e tortuosa: guida con cautela.", "Porta acqua: nel borgo non ci sono negozi né bar.", "La luce del tramonto sulle mura del castello crea fotografie straordinarie."]
  },
  "bova-borgo": {
    intro: `Bova è il cuore culturale dell'area grecanica della Calabria e uno dei borghi medievali più integri del Sud Italia. Arroccato a 900 metri sul versante ionico dell'Aspromonte, domina un panorama vastissimo che spazia dal Mar Ionio fino all'Etna nelle giornate terse.\n\nBova è l'unico comune calabrese dove il griko — dialetto di origine greco-bizantina — è ancora una lingua viva, tutelata dallo Stato come minoranza linguistica storica. Il borgo conserva il castello normanno, la Cattedrale dell'Assunta (XI sec.), il Museo della lingua grecanica e numerosi palazzi del Seicento.`,
    cards: [
      { icon: "🗣️", title: "Il griko", text: "Il griko parlato a Bova è l'erede diretto del greco medievale diffuso in Calabria dai coloni greco-bizantini. Alcune parole derivano direttamente dall'antico greco classico." },
      { icon: "⛪", title: "La Cattedrale", text: "La Cattedrale dell'Assunta, ricostruita dopo il 1783, conserva frammenti della struttura normanna originale e un pregiato polittico del XVI secolo." },
      { icon: "🏰", title: "Il castello", text: "Del castello normanno (XI sec.) restano il torrione e parte delle mura. Fu residenza dei feudatari che controllarono la Bovesia per tutto il Medioevo." },
      { icon: "🌄", title: "Il panorama", text: "Dal belvedere si vede l'intera costa ionica fino a Locri a nord e Capo Spartivento a sud. Nelle giornate di tramontana l'Etna sembra vicinissima." }
    ],
    tips: ["Visita il Museo della Cultura Grecanica: raccoglie documenti, oggetti e registrazioni audio sulla lingua e le tradizioni locali.", "La Festa dell'Assunta (15 agosto) è l'evento più sentito del borgo.", "Il centro storico si percorre a piedi in 30-40 minuti: non ci sono auto."]
  },
  "bova-belvedere": {
    intro: `Il belvedere di Bova è uno dei punti panoramici più straordinari della Calabria. Posto sulla cresta dell'Aspromonte a quasi 900 metri, offre una vista simultanea su due mari — lo Ionio a est e, nelle giornate limpide, il mare di Sicilia verso sud-ovest — e sull'intera dorsale aspromontana.\n\nIl panorama si estende per decine di chilometri: verso nord la costa ionica fino al Golfo di Squillace, verso sud il Capo Spartivento, verso ovest le vette dell'Aspromonte con Montalto (1.956 m), verso est il profilo dell'Etna.`,
    cards: [
      { icon: "🌍", title: "Due mari", text: "Il promontorio calabrese è così stretto che dal belvedere si riesce a scorgere sia lo Ionio che il Tirreno nelle giornate di massima visibilità." },
      { icon: "🦅", title: "L'Aspromonte", text: "Il massiccio dell'Aspromonte occupa l'intera punta della Calabria. Dal belvedere si osserva la struttura geologica del massiccio: gneiss e graniti modellati dall'erosione." },
      { icon: "🌡️", title: "Il clima", text: "A 900 metri la temperatura è sensibilmente più fresca rispetto alla costa: sollievo naturale dal caldo estivo, neve d'inverno." },
      { icon: "🌙", title: "Notte", text: "L'assenza di inquinamento luminoso rende il belvedere di Bova uno dei migliori punti per l'osservazione astronomica della Calabria." }
    ],
    tips: ["Porta un binocolo: con il bel tempo si vede nitidamente l'Etna.", "Il belvedere è ventoso: porta uno strato aggiuntivo anche d'estate.", "Combinalo con la visita al borgo a pochi metri di distanza."]
  },
  "gerace-centro": {
    intro: `Gerace è uno dei borghi medievali meglio conservati della Calabria. Posto su un'imprendibile rupe di arenaria a 475 metri sul mare, fu fondato nell'VIII-IX secolo come rifugio per la popolazione di Locri Epizefiri dopo le incursioni saracene. Il borgo medievale è rimasto sostanzialmente intatto: chiese normanne, palazzi angioini e aragonesi, vicoli lastricati.\n\nGerace fu sede vescovile dal IX secolo fino all'Unità d'Italia. La sua storia riflette le dominazioni susseguitesi in Calabria: Greci, Romani, Saraceni, Normanni, Svevi, Angioini, Aragonesi e Borboni hanno tutti lasciato tracce nel tessuto urbano.`,
    cards: [
      { icon: "⛪", title: "La Cattedrale normanna", text: "Costruita dai Normanni nel 1045, è la più grande cattedrale della Calabria. Conserva colonne di reimpiego greco-romane provenienti da Locri." },
      { icon: "🏰", title: "Il castello", text: "Il castello di origine normanna, rafforzato dagli Angioini nel XIII secolo, domina la rupe dal punto più alto del borgo." },
      { icon: "🕌", title: "Le chiese", text: "Il borgo conta oltre venti chiese per poche centinaia di abitanti: testimonianza dell'importanza religiosa di Gerace come sede vescovile millenaria." },
      { icon: "🪨", title: "La rupe", text: "La rupe di arenaria calcarea, quasi inaccessibile su tre lati, fu la naturale difesa che permise al borgo di resistere alle incursioni medievali." }
    ],
    tips: ["La visita alla Cattedrale è imperdibile: nota le colonne di marmo greco-romano.", "Il castello offre la vista migliore sulla Locride e sulla costa ionica.", "Il borgo si visita a piedi in 1,5-2 ore su selciato antico."]
  },
  "gerace-cattedrale": {
    intro: `La Cattedrale dell'Assunta di Gerace è il più grande edificio romanico normanno della Calabria. Fondata nel 1045 dal Gran Conte Ruggero I d'Altavilla, la basilica a tre navate misura 41 metri di lunghezza e conserva intatti gli elementi strutturali originali: le colonne di marmo e granito provenienti da Locri Epizefiri e la cripta paleocristiana sotterranea.\n\nLa facciata mostra un portale barocco del XVII secolo. La cripta, accessibile dalle navate laterali, custodisce colonne e capitelli di età classica di straordinaria qualità.`,
    cards: [
      { icon: "🏛️", title: "Le colonne di spoglio", text: "Le 26 colonne che dividono le tre navate provengono da Locri Epizefiri: marmo cipollino, granito grigio e bigio antico — un museo della statuaria classica in un edificio medievale." },
      { icon: "⛏️", title: "La cripta", text: "La cripta paleocristiana (VI-VII sec.) conserva colonne romane e capitelli di eccezionale fattura, tra cui uno corinzio di dimensioni straordinarie." },
      { icon: "🔔", title: "Il campanile", text: "Il campanile romanico è visibile dall'intera vallata della Locride. Le trifore e le bifore dei piani superiori sono di raffinata fattura normanna." },
      { icon: "🎨", title: "Gli affreschi", text: "Frammenti di affreschi medievali nelle absidi laterali: il più conservato rappresenta una Madonna in trono con Bambino di scuola bizantina." }
    ],
    tips: ["Scendi nella cripta: accessibile gratuitamente, è straordinaria.", "Il chiostro adiacente conserva capitelli medievali originali.", "Fotografa l'interno di mattina quando la luce entra dai finestroni dell'abside."]
  },
  "locri-parco": {
    intro: `Il Parco Archeologico di Locri Epizefiri è uno dei siti della Magna Grecia più importanti d'Italia. Locri fu fondata verso il 680 a.C. da coloni greci del Peloponneso e divenne famosa per essere stata la prima città del mondo antico ad adottare un codice di leggi scritto — le Leggi di Zaleuco (663 a.C.), antecedenti alle leggi di Dracone ad Atene.\n\nIl sito si estende su circa 1.600 ettari. Le aree visitabili includono: il teatro greco-romano, i resti del Tempio di Marasà, il Tempio di Persefone sul Mannella, le necropoli e le mura di cinta.`,
    cards: [
      { icon: "📜", title: "Le Leggi di Zaleuco", text: "Verso il 663 a.C. Zaleuco redasse per Locri il primo codice di leggi scritte della storia occidentale, incise su tavole di bronzo esposte pubblicamente." },
      { icon: "🏛️", title: "Il Tempio di Marasà", text: "Uno dei più antichi templi della Magna Grecia (VII sec. a.C.). Il museo espone le straordinarie metope del fregio." },
      { icon: "🎭", title: "Il teatro", text: "Il teatro greco-romano, scavato nella collina, aveva circa 4.500 posti. È ancora utilizzato d'estate per rappresentazioni teatrali." },
      { icon: "🏺", title: "I pinakes", text: "Tavolette votive in terracotta dipinta offerte a Persefone: tra i documenti figurativi più preziosi dell'antichità greca." }
    ],
    tips: ["Visita prima il Museo Nazionale per capire il contesto storico.", "Porta scarpe da camminata: i percorsi sono in parte su terreno naturale.", "D'estate il parco è esposto al sole: porta acqua e cappello."]
  },
  "locri-lungomare": {
    intro: `Il lungomare di Locri si estende per oltre tre chilometri lungo la costa ionica, offrendo una passeggiata pianeggiante con vista sul mare. La costa è caratterizzata da spiagge di ciottoli e sabbia con acque limpide, lambita dalla Corrente Ionica che mantiene le temperature marine elevate anche in autunno.\n\nLocri è un punto di riferimento per tutta la Locride: il suo lungomare è il cuore della vita serale con locali, concerti estivi e il famoso Locri Jazz Festival.`,
    cards: [
      { icon: "🌊", title: "Il mare ionico", text: "La costa ionica della Locride è meno battuta dal vento rispetto al versante tirrenico: il mare è spesso piatto e ideale per nuotare." },
      { icon: "🎶", title: "Locri Jazz Festival", text: "Il lungomare ospita in luglio-agosto il Locri Jazz Festival, manifestazione di respiro nazionale con artisti internazionali." },
      { icon: "🐠", title: "La fauna marina", text: "Le praterie di posidonia offshore ospitano saraghi, morene, polpi e occasionalmente tartarughe caretta caretta che nidificano sulla costa." },
      { icon: "🏃", title: "Sport", text: "Il lungomare pianeggiante è pista naturale per runner e ciclisti. Si può estendere verso Caulonia a nord o Siderno a sud." }
    ],
    tips: ["Spiagge libere agli estremi del lungomare; il tratto centrale è quasi tutto in concessione.", "La mattina presto è quasi deserto: ideale per una corsa.", "Il mercato del pesce locale si tiene ogni mattina nella zona portuale."]
  },
  "melito-centro": {
    intro: `Melito di Porto Salvo è il comune più meridionale della Calabria continentale. La città moderna si è formata principalmente nel Novecento dopo il disastroso terremoto del 1908. Melito è il punto di partenza naturale per esplorare l'area grecanica verso est e la fascia costiera ionica verso nord.\n\nLa città è nota per la produzione di bergamotto, agrume la cui coltivazione è concentrata quasi esclusivamente nella fascia costiera tra Villa San Giovanni e Melito: il suo olio essenziale è fondamentale nell'industria della profumeria mondiale.`,
    cards: [
      { icon: "🍋", title: "Il bergamotto", text: "Il bergamotto di Reggio Calabria DOP cresce quasi esclusivamente su questa fascia costiera. Il suo olio essenziale entra in profumi celebri come l'Earl Grey e il Chanel N°5." },
      { icon: "📍", title: "Punta Pezzo", text: "A pochi km da Melito si trova Punta Pezzo, il punto più meridionale della Calabria continentale, segnato da un faro." },
      { icon: "🌊", title: "La fiumara", text: "La fiumara che attraversa il centro è tipica dell'area: asciutta d'estate, può trasformarsi in un torrente pericoloso durante le piogge autunnali." },
      { icon: "🛤️", title: "Punto di partenza", text: "Dalla SS106 si diramano le strade verso Pentedattilo (15 min), Condofuri e Bova (45 min). Ottima base per itinerari nell'entroterra grecanico." }
    ],
    tips: ["Visita il mercato locale al mattino per bergamotti freschi (novembre-febbraio).", "Il lungomare di Melito è frequentato soprattutto la sera: buoni locali di pesce fresco.", "Da qui si raggiunge agevolmente Pentedattilo e Bova in auto."]
  },
  "melito-lungomare": {
    intro: `Il lungomare di Melito di Porto Salvo si affaccia sul Mar Ionio nella sua parte più meridionale. La spiaggia è prevalentemente sassosa con tratti sabbiosi, con acque limpide particolarmente adatte al nuoto in tarda estate quando il mare è calmissimo.\n\nIl lungomare è il luogo della vita quotidiana di Melito nel tardo pomeriggio: pescatori che sistemano le reti, anziani sulle panchine, bambini che giocano. Un'atmosfera autentica del Sud Italia, lontana dai circuiti turistici.`,
    cards: [
      { icon: "🎣", title: "La pesca", text: "I pescatori di Melito usano tecniche tradizionali: lampare per le alici notturne, reti a strascico, palangari per il pesce spada." },
      { icon: "🌅", title: "L'alba", text: "Melito si affaccia a est: l'alba sul Mar Ionio è uno spettacolo quotidiano che i pescatori di ritorno dalla pesca notturna conoscono bene." },
      { icon: "🌿", title: "I bergamotteti", text: "Dietro il lungomare si estendono i bergamotteti: file di alberi sempre verdi con frutti giallo-verdi e l'Aspromonte come sfondo." },
      { icon: "⚓", title: "Il porto", text: "Il piccolo porto ospita barche da pesca e da diporto. D'estate alcune imbarcazioni organizzano escursioni lungo la costa grecanica." }
    ],
    tips: ["Per il pesce fresco a prezzi locali, chiedi ai pescatori direttamente al porto al mattino.", "La spiaggia è poco frequentata anche in agosto rispetto alle località più note.", "Porta scarpe da scoglio: buona parte del litorale è ciottoloso."]
  },
  "condofuri-marina": {
    intro: `Condofuri Marina è la parte costiera del comune di Condofuri, uno dei centri dell'area grecanica della Calabria. Si trova sulla fascia ionica tra Melito e Bova Marina, in un tratto dove la costa è ancora relativamente incontaminata e le spiagge conservano un carattere autentico.\n\nL'area è caratterizzata dalla presenza delle fiumare — i torrenti stagionali tipici dell'Aspromonte — che scendono dalle montagne portando ghiaia e ciottoli sulla spiaggia. Il paesaggio alterna spiagge ciottolose, macchia mediterranea e agrumeti di bergamotto.`,
    cards: [
      { icon: "🏖️", title: "La spiaggia", text: "Alterna sabbia e ciottoli. Ampia e poco affollata, con fondali che degradano dolcemente e acque limpide grazie alla scarsa industrializzazione della costa." },
      { icon: "🌿", title: "La natura", text: "La macchia mediterranea arriva quasi fino alla spiaggia: oleandri, fichi d'india, agavi e bergamotteti creano un paesaggio profumato." },
      { icon: "🏔️", title: "Il panorama", text: "Dalla spiaggia si vede chiaramente l'Aspromonte che scende quasi a picco sul mare, creando un paesaggio verticale insolito per una costa mediterranea." },
      { icon: "🐢", title: "Le tartarughe", text: "La costa grecanica è area di nidificazione della Caretta caretta. In estate i volontari sorvegliano i nidi per proteggere le uova." }
    ],
    tips: ["La spiaggia è quasi completamente libera: non ci sono stabilimenti balneari.", "Porta tutto il necessario: bar e negozi sono nel paese a qualche km.", "Le fiumare in estate sono asciutte: si possono percorrere a piedi verso l'interno."]
  },
  "tropea-pranzo": {
    intro: `La gastronomia di Tropea è una delle più ricche della Calabria, costruita attorno alla cipolla rossa locale e ai prodotti del Mar Tirreno. I piatti tipici includono la pasta al sugo di cipolla rossa, il pesce spada alla reggina con cipolla e capperi, la 'nduja fresca su pane di mais e la pitta 'mpigliata — dolce natalizio ripieno di fichi, miele e frutta secca.`,
    cards: [
      { icon: "🧅", title: "La cipolla rossa", text: "Presidio Slow Food: dolcissima e poco acre, si usa in marmellata, cruda nelle insalate, nel sugo della pasta e nelle conserve agrodolci." },
      { icon: "🐟", title: "Il pesce spada", text: "Il pesce spada dello Stretto è considerato il migliore del Mediterraneo. A Tropea si prepara alla ghiotta con pomodorini, olive, capperi e cipolla." },
      { icon: "🌶️", title: "La 'nduja", text: "La 'nduja di Spilinga — piccante, spalmabile, a base di carne di maiale e peperoncino — è il condimento calabrese più famoso al mondo." },
      { icon: "🍷", title: "I vini", text: "I vini locali includono il Cirò Rosso DOC e il Bivongi DOC. Le cantine dell'entroterra producono anche Greco di Bianco, vino passito tra i più antichi della Calabria." }
    ],
    tips: ["Prenota in anticipo d'estate: i migliori ristoranti si riempiono rapidamente.", "Al mercato in piazza trovi cipolla rossa, bergamotto e conserve artigianali da portare a casa.", "L'ora di pranzo è 13-15; l'ora di cena è 20-22: rispetta gli orari locali."]
  },
  "scilla-cena": {
    intro: `Scilla è uno dei migliori posti della Calabria per mangiare pesce fresco. Il pesce spada dello Stretto — pescato con metodi tradizionali da maggio a settembre — è il re della cucina locale, insieme ai gamberoni rossi di Bagnara, considerati tra i migliori d'Italia.\n\nIl borgomarinaro di Chianalea offre ristoranti con i tavoli letteralmente sull'acqua: pesce appena pescato, pomodori locali, olio extravergine calabrese e una cultura gastronomica autentica.`,
    cards: [
      { icon: "⚔️", title: "Il pesce spada", text: "La pesca tradizionale nello Stretto è un'arte secolare. Le barche con l'antenna cacciano da maggio a settembre nel punto più stretto del canale." },
      { icon: "🦐", title: "I gamberi di Bagnara", text: "Il gambero rosso di Bagnara, pescato a 300-600 m di profondità, è tra i crostacei più pregiati del Mediterraneo. Si mangia crudo in carpaccio o in risotto." },
      { icon: "🍝", title: "La pasta", text: "La pasta al pesce spada è il piatto simbolo di Scilla: spaghetti con ragù di pesce spada, pomodorini, capperi, olive e melanzane fritte." },
      { icon: "🌊", title: "Mangiare a Chianalea", text: "I ristoranti del borgo marinaro hanno i tavoli sul pontile o nel vicolo con vista sul mare." }
    ],
    tips: ["Prenota il tavolo con vista mare almeno una settimana prima in luglio-agosto.", "Chiedi sempre qual è il pesce del giorno: la freschezza è garantita.", "Il pesce spada è stagionale (maggio-settembre): fuori stagione non garantisce la stessa qualità."]
  },
  "bova-degustazione": {
    intro: `La cucina dell'area grecanica, che comprende i comuni di Bova, Condofuri, Palizzi e dintorni, è tra le più originali e meno conosciute della Calabria. Isolata geograficamente per secoli, ha conservato ricette di origine greco-medievale andate perse altrove.\n\nI prodotti tipici includono formaggi pecorini stagionati nelle grotte dell'Aspromonte, salumi locali, miele millefiori tra i più pregiati d'Italia e la pitta 'mpigliata — dolce di fichi e miele di antichissima origine.`,
    cards: [
      { icon: "🐑", title: "I formaggi di pecora", text: "Il pecorino dell'Aspromonte, stagionato in grotte naturali a temperature costanti, ha sapori intensi e complessi. I caseifici artigianali di Bova producono quantità limitate." },
      { icon: "🍯", title: "Il miele", text: "I boschi dell'Aspromonte producono miele di corbezzolo (amaro), di castagno, di bergamotto e millefiori di alta quota." },
      { icon: "🫚", title: "L'olio", text: "Gli oliveti pluricentenari dell'area grecanica producono un olio extravergine fruttato e leggermente piccante. La raccolta avviene in novembre in modo prevalentemente manuale." },
      { icon: "🌿", title: "Le erbe", text: "La cucina grecanica usa erbe spontanee dell'Aspromonte: origano, finocchio selvatico, menta, timo e nepitella entrano in molte ricette della tradizione locale." }
    ],
    tips: ["Cerca i produttori locali: la vendita diretta garantisce qualità e prezzi onesti.", "Le sagre estive nei comuni grecanici sono occasioni per assaggiare piatti rarissimi.", "Il miele di corbezzolo si vende solo da novembre a gennaio: se lo trovi, compralo."]
  }
};

// =====================================================

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

  const gallery = poi.gallery;
  if (gallery && gallery.length > 1) {
    const galleryContainer = document.getElementById("luogo-gallery");
    if (galleryContainer) {
      galleryContainer.innerHTML = gallery.map((src, i) => `
        <div class="gallery-thumb" onclick="openLightbox('${src}','${poi.name} - foto ${i+1}')">
          <img src="${src}" alt="${poi.name} - foto ${i+1}" onerror="this.parentElement.style.display='none'" />
        </div>`).join("");
      const gs = document.getElementById("gallery-section");
      if (gs) gs.style.display = "block";
    }
  }
}

// ---- MAPPA CON PERCORSO ----
let routeMap = null;

function initRouteMap(poi) {
  const mapSection = document.getElementById("route-map-section");
  if (!mapSection) return;
  mapSection.style.display = "block";

  const mapEl = document.getElementById("route-map");
  if (!mapEl || routeMap) return;

  routeMap = L.map(mapEl, { zoomControl: true }).setView([poi.lat, poi.lng], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors", maxZoom: 19
  }).addTo(routeMap);

  const destIcon = L.divIcon({
    html: `<div style="background:#073b52;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.35)"></div>`,
    iconSize: [34, 34], iconAnchor: [17, 34], className: ""
  });

  L.marker([poi.lat, poi.lng], { icon: destIcon }).addTo(routeMap)
    .bindPopup(`<strong>${poi.name}</strong><br>${poi.area}`).openPopup();

  const statusEl = document.getElementById("route-status");

  if (navigator.geolocation) {
    statusEl.textContent = "📍 Rilevamento posizione in corso...";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: uLat, longitude: uLng } = pos.coords;
        const userIcon = L.divIcon({
          html: `<div style="background:#f29f05;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8], className: ""
        });
        L.marker([uLat, uLng], { icon: userIcon }).addTo(routeMap).bindPopup("📍 La tua posizione");
        drawRoute(uLat, uLng, poi.lat, poi.lng, statusEl);
        routeMap.fitBounds([[uLat, uLng], [poi.lat, poi.lng]], { padding: [40, 40] });
      },
      () => { statusEl.textContent = "Posizione non disponibile — mostrata solo la destinazione"; },
      { timeout: 8000 }
    );
  } else {
    statusEl.textContent = "Geolocalizzazione non supportata da questo browser";
  }
}

async function drawRoute(fromLat, fromLng, toLat, toLng, statusEl) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.code !== "Ok" || !data.routes?.length) throw new Error("No route");
    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    const distKm = (data.routes[0].distance / 1000).toFixed(1);
    const mins   = Math.round(data.routes[0].duration / 60);
    L.polyline(coords, { color: "#0f6e8c", weight: 5, opacity: 0.82, smoothFactor: 1 }).addTo(routeMap);
    statusEl.innerHTML = `🚗 Percorso: <strong>${distKm} km</strong> · circa <strong>${mins} min</strong> in auto`;
  } catch {
    L.polyline([[fromLat, fromLng], [toLat, toLng]], {
      color: "#0f6e8c", weight: 3, opacity: 0.6, dashArray: "8 6"
    }).addTo(routeMap);
    statusEl.textContent = "Percorso indicativo (serve server locale per il percorso stradale reale)";
  }
}

// ---- API ANTHROPIC (solo chat) ----
async function callClaude({ apiKey, system, messages, maxTokens = 1000, useWebSearch = false }) {
  const body = { model: "claude-sonnet-4-5", max_tokens: maxTokens, messages };
  if (system) body.system = system;
  if (useWebSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify(body)
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message || `HTTP ${resp.status}`);
  return data.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
}

// ---- CHAT ----
let chatHistory = [];

function initChat(poi) {
  chatHistory = [];
  const chatSection = document.getElementById("chat-section");
  if (chatSection) chatSection.style.display = "block";
  const chatInput = document.getElementById("chat-input");
  const chatSend  = document.getElementById("chat-send");
  if (!chatInput || !chatSend) return;
  appendChatMessage("bot", `Ciao! 👋 Sono la tua guida virtuale per <strong>${poi.name}</strong>.<br>Chiedimi tutto: storia, orari, curiosità, come arrivare…`);
  chatSend.addEventListener("click", () => sendChatMessage(poi));
  chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(poi); } });
}

function appendChatMessage(role, html) {
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) return;
  const div = document.createElement("div");
  div.className = `chat-msg chat-msg-${role}`;
  div.innerHTML = html;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendChatMessage(poi) {
  const chatInput = document.getElementById("chat-input");
  const chatSend  = document.getElementById("chat-send");
  const apiKey    = getApiKey();
  const text = chatInput.value.trim();
  if (!text) return;
  if (!apiKey) { showApiKeyModal((key) => { saveApiKey(key); chatInput.value = text; sendChatMessage(poi); }); return; }
  chatInput.value = "";
  chatSend.disabled = true;
  appendChatMessage("user", text);
  const typingId = "typing-" + Date.now();
  const td = document.createElement("div");
  td.id = typingId; td.className = "chat-msg chat-msg-bot chat-typing";
  td.innerHTML = `<span></span><span></span><span></span>`;
  document.getElementById("chat-box").appendChild(td);
  document.getElementById("chat-box").scrollTop = 99999;
  chatHistory.push({ role: "user", content: text });
  const sys = `Sei una guida turistica esperta della Calabria, specializzata in ${poi.name} (${poi.area}).\nDati: Nome: ${poi.name}, Area: ${poi.area}, Categoria: ${poi.categoryLabel}, Descrizione: ${poi.description}, Durata: ${poi.visitMinutes} minuti.\nNon inventare informazioni. Rispondi in italiano, cordiale. Max 3-4 paragrafi.`;
  try {
    const reply = await callClaude({ apiKey, system: sys, messages: chatHistory, maxTokens: 800, useWebSearch: true });
    document.getElementById(typingId)?.remove();
    if (reply) { chatHistory.push({ role: "assistant", content: reply }); appendChatMessage("bot", reply.replace(/\n/g, "<br>")); }
  } catch (err) {
    document.getElementById(typingId)?.remove();
    if (err.message.includes("invalid x-api-key") || err.message.includes("authentication")) {
      localStorage.removeItem("calabria_anthropic_key");
      appendChatMessage("bot", "🔑 Chiave API non valida. Inseriscine una nuova.");
      showApiKeyModal((key) => { saveApiKey(key); });
    } else {
      appendChatMessage("bot", `⚠️ Errore: ${err.message}.`);
    }
  }
  chatSend.disabled = false;
  chatInput.focus();
}

function showApiKeyModal(onSave) {
  let modal = document.getElementById("api-key-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "api-key-modal";
    modal.style.cssText = `position:fixed;inset:0;background:rgba(7,59,82,0.72);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);`;
    modal.innerHTML = `<div style="background:#fffaf3;border-radius:24px;padding:32px;max-width:460px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);"><h3 style="margin:0 0 8px;color:#073b52;font-size:1.3rem;">🔑 Chiave API per la chat</h3><p style="margin:0 0 20px;color:#5d6b78;font-size:0.93rem;line-height:1.5;">Per la guida virtuale serve la tua chiave API Anthropic.<br>Viene salvata nel browser e non inviata altrove.<br><a href="https://console.anthropic.com/account/keys" target="_blank" style="color:#0f6e8c">Ottieni una chiave →</a></p><input type="password" id="modal-api-input" placeholder="sk-ant-..." style="width:100%;box-sizing:border-box;min-height:46px;border-radius:12px;border:1px solid rgba(31,41,51,0.2);background:rgba(255,255,255,0.8);padding:0 14px;font:inherit;font-size:0.95rem;margin-bottom:14px;" /><div style="display:flex;gap:10px;"><button id="modal-save-btn" style="flex:1;min-height:44px;border-radius:12px;background:#073b52;color:white;border:none;font:inherit;font-size:0.95rem;font-weight:600;cursor:pointer;">Salva e continua</button><button id="modal-cancel-btn" style="min-height:44px;padding:0 18px;border-radius:12px;background:transparent;color:#5d6b78;border:1px solid rgba(31,41,51,0.2);font:inherit;cursor:pointer;">Annulla</button></div></div>`;
    document.body.appendChild(modal);
  }
  modal.style.display = "flex";
  const input = document.getElementById("modal-api-input");
  input.value = "";
  setTimeout(() => input.focus(), 50);
  document.getElementById("modal-save-btn").onclick = () => {
    const key = input.value.trim();
    if (!key.startsWith("sk-ant-")) { input.style.borderColor = "#cf5c36"; return; }
    modal.style.display = "none"; onSave(key);
  };
  document.getElementById("modal-cancel-btn").onclick = () => { modal.style.display = "none"; };
}

// ---- RENDER DESCRIZIONE STATICA ----
function renderStaticDescription(poi) {
  const story = POI_STORIES[poi.id];
  const aiLoading = document.getElementById("ai-loading");
  const aiContent = document.getElementById("ai-content");
  if (aiLoading) aiLoading.style.display = "none";
  if (aiContent) aiContent.style.display = "flex";

  const introEl = document.getElementById("ai-intro");
  if (introEl) {
    const text = story?.intro || `${poi.description}\n\nCategoria: ${poi.categoryLabel} · ${poi.visitMinutes} minuti di visita consigliati.`;
    introEl.innerHTML = text.split("\n").filter(p => p.trim()).map(p => `<p>${p}</p>`).join("");
  }

  const gridEl = document.getElementById("ai-grid");
  const cards = story?.cards || [
    { icon: "📍", title: "Dove si trova", text: `${poi.name} si trova nel comune di ${poi.area}, in Calabria.` },
    { icon: "🕐", title: "Tempo consigliato", text: `Riserva almeno ${poi.visitMinutes} minuti per la visita.` },
    { icon: "🏷️", title: "Categoria", text: poi.categoryLabel }
  ];
  if (gridEl) {
    gridEl.innerHTML = cards.map(c => `
      <div class="ai-card">
        <div class="ai-card-icon">${c.icon}</div>
        <h4>${c.title}</h4>
        <p>${c.text}</p>
      </div>`).join("");
  }

  const tipsEl = document.getElementById("ai-tips");
  const tips = story?.tips || ["Verifica gli orari di apertura prima di partire.", "Indossa scarpe comode per percorsi a piedi.", "La luce migliore per le foto è al mattino presto o prima del tramonto."];
  if (tipsEl) {
    tipsEl.innerHTML = `<h4>Consigli pratici</h4><ul>${tips.map(t => `<li>${t}</li>`).join("")}</ul>`;
  }
}

// ---- INIT ----
async function init() {
  const id = getPoiId();
  if (!id) { window.location.href = "index.html"; return; }
  const poi = POIS_DATA.find(p => p.id === id);
  if (!poi) { window.location.href = "index.html"; return; }

  document.getElementById("loading-state").style.display = "none";
  document.getElementById("luogo-content").style.display = "block";

  renderPoiInfo(poi);
  initRouteMap(poi);
  initChat(poi);
  renderStaticDescription(poi);
}

init();
