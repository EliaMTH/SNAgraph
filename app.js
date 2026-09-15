// Tre matrici di co-occorrenza sugli stessi 48 concetti. I dati stanno in data.js.

const $ = (id) => document.getElementById(id);

// Interpola v da [lo,hi] a [a,b]. Usata per dimensione dei nodi e spessore degli archi.
const scale = (v, lo, hi, a, b) => (hi === lo ? (a + b) / 2 : a + ((v - lo) / (hi - lo)) * (b - a));
const extent = (values) => [Math.min(...values), Math.max(...values)];

const cy = cytoscape({
  container: $("cy"),
  autoungrabify: true, // nodi non trascinabili: la disposizione resta fissa
  boxSelectionEnabled: false,
  layout: { name: "preset" }, // posizioni precalcolate in data.js
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#2f6fb0",
        width: "data(size)",
        height: "data(size)",
        label: "data(label)",
        "font-weight": "bold",
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "text-outline-color": "#fafafa", // stacca l'etichetta dagli archi sottostanti
        // dimensione, margine, larghezza e contorno del testo li imposta labelSize()
      },
    },
    {
      selector: "edge",
      style: { width: 1, "line-color": "#9bb3cc", opacity: 0.5 },
    },
    // Archi del nodo selezionato: colore del nodo, pieni, e spessore dato dal peso.
    {
      selector: "edge.on",
      style: { width: "data(widthOn)", "line-color": "#e2632f", opacity: 0.95 },
    },
    // Attenuato: le etichette si spengono del tutto, a bassa opacita' sarebbero solo rumore.
    // Ogni etichetta viene disegnata insieme al suo nodo, quindi un nodo disegnato dopo
    // copre le etichette dei precedenti. Abbassando lo z-index gli attenuati passano per
    // primi e le etichette in evidenza restano sopra. Si attiva e disattiva da solo:
    // le classi ci sono solo quando c'e' una selezione.
    { selector: ".faded", style: { opacity: 0.1, "text-opacity": 0, "z-index": -1 } },
    { selector: "node.current", style: { "background-color": "#e2632f", "z-index": 1 } },
  ],
});

// Le etichette vivono nelle coordinate del grafo, quindi rimpiccioliscono zoomando
// indietro. Qui la dimensione viene compensata sullo zoom, cosi' restano leggibili.
const FONT = 15;     // dimensione delle etichette in px sullo schermo
const FONT_MAX = 44; // tetto: oltre, da molto lontano, si accavallerebbero

function labelSize() {
  const size = Math.min(FONT / cy.zoom(), FONT_MAX);
  cy.nodes().style({
    "font-size": size,
    "text-margin-y": size * 0.3,
    "text-max-width": size * 11,
    "text-outline-width": size * 0.2,
  });
}

cy.on("zoom", labelSize);

// Ordine di disegno: a parita' di z-index vince l'ordine di inserimento. L'etichetta
// sta sotto al suo nodo, quindi si inserisce dal nodo piu' in basso a quello piu' in
// alto: chi sta sotto viene disegnato prima e non copre l'etichetta di chi sta sopra.
// Copia, cosi' DATA resta com'e'; l'ordinamento gira una volta sola al caricamento.
const byY = [...DATA.nodes].sort((a, b) => b.y - a.y);

// Disegna il grafo scelto: i 48 nodi ci sono sempre e nelle stesse posizioni,
// cambiano solo gli archi e le dimensioni.
function show(name) {
  const g = DATA.graphs[name];
  cy.elements().remove();
  cy.add([
    ...byY.map((n) => ({
      data: { id: n.id, label: n.label, weight: g.weights[n.id] },
      position: { x: n.x, y: n.y },
    })),
    ...g.edges.map(([s, t, w]) => ({
      data: { id: `${s}-${t}`, source: String(s), target: String(t), weight: w },
    })),
  ]);

  // Le scale cambiano molto fra i tre grafi (grado 10-45 in ALL, 0-36 in GG-EU),
  // quindi si ricalcolano ogni volta sugli estremi del grafo corrente.
  const [dMin, dMax] = extent(cy.nodes().map((n) => n.degree()));
  cy.nodes().forEach((n) => n.data("size", scale(n.degree(), dMin, dMax, 12, 50)));
  // Lo spessore mostra il peso solo sugli archi in evidenza: a riposo restano tutti
  // sottili uguali, altrimenti con 803 archi il grafo diventa una massa illeggibile.
  // I pesi sono molto sbilanciati (mediana 2, massimo 22), quindi la scala e' sulla
  // radice: sui valori bassi, dove sta quasi tutto, si distinguono meglio.
  // Gli estremi sono quelli dell'intero grafo, non del solo vicinato, cosi' uno stesso
  // peso ha sempre lo stesso spessore da una selezione all'altra.
  const [wMin, wMax] = extent(cy.edges().map((e) => Math.sqrt(e.data("weight"))));
  cy.edges().forEach((e) => e.data("widthOn", scale(Math.sqrt(e.data("weight")), wMin, wMax, 1.5, 18)));

  cy.fit(40);
  labelSize();
  reset();
}

function reset() {
  cy.elements().removeClass("faded current on");
  $("panel").hidden = true;
}

cy.on("tap", "node", (e) => {
  const n = e.target;
  cy.elements().addClass("faded").removeClass("current on"); // azzera l'evidenza precedente
  n.closedNeighborhood().removeClass("faded"); // nodo + vicini + archi incidenti
  n.addClass("current");
  n.connectedEdges().addClass("on");

  $("p-label").textContent = n.data("label");
  $("p-id").textContent = n.id();
  $("p-graph").textContent = $("graph").value;
  $("p-weight").textContent = n.data("weight");
  $("p-degree").textContent = n.degree();
  $("p-strength").textContent = n.connectedEdges().reduce((sum, e) => sum + e.data("weight"), 0);
  $("panel").hidden = false;
});

cy.on("tap", (e) => {
  if (e.target === cy) reset(); // click sullo sfondo
});

$("graph").onchange = (e) => show(e.target.value);
show($("graph").value);
