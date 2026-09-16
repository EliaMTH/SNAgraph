// Three co-occurrence matrices over the same 48 concepts. Data lives in data.js.

const $ = (id) => document.getElementById(id);

// Linear interpolation from [lo,hi] to [a,b]: node sizes and edge widths.
const scale = (v, lo, hi, a, b) => (hi === lo ? (a + b) / 2 : a + ((v - lo) / (hi - lo)) * (b - a));
const extent = (values) => [Math.min(...values), Math.max(...values)];

const cy = cytoscape({
  container: $("cy"),
  autoungrabify: true, // nodes are not draggable, so the layout stays fixed
  boxSelectionEnabled: false,
  layout: { name: "preset" }, // positions come precomputed from data.js
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
        "text-outline-color": "#fafafa", // lifts the label off the edges behind it
        // labelSize() sets font size, margin, wrap width and outline
      },
    },
    {
      selector: "edge",
      style: { width: 1, "line-color": "#9bb3cc", opacity: 0.5 },
    },
    // Edges of the selected node: orange, opaque, thickness from the weight.
    {
      selector: "edge.on",
      style: { width: "data(widthOn)", "line-color": "#e2632f", opacity: 0.95 },
    },
    // Each label is drawn with its own node, so a node drawn later covers earlier labels.
    // A lower z-index sends faded nodes to the back, keeping highlighted labels on top.
    // Self-toggling: these classes only exist while something is selected.
    { selector: ".faded", style: { opacity: 0.1, "text-opacity": 0, "z-index": -1 } },
    // Selected node: dark, so it is not mistaken for the orange edges, with a light ring
    // separating it from the edges converging on it and a dark one outside.
    {
      selector: "node.current",
      style: {
        "background-color": "#1f2937",
        "border-width": 3,
        "border-color": "#fafafa",
        "outline-width": 2,
        "outline-color": "#1f2937",
        "outline-offset": 2,
        "z-index": 1,
      },
    },
  ],
});

// Labels live in graph coordinates, so they shrink as you zoom out. Compensating for
// the zoom keeps them at a constant size on screen.
const FONT = 15;     // label size in screen px
const FONT_MAX = 44; // cap: past this, labels would pile up when zoomed far out

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

// Draw order: with equal z-index, insertion order wins. A label sits below its node, so
// nodes go in bottom-up: lower ones are drawn first and never cover the label of a node
// above them. Copied, so DATA is left alone; sorted once on load.
const byY = [...DATA.nodes].sort((a, b) => b.y - a.y);

// Draw the chosen graph: all 48 nodes are always there in the same positions, only the
// edges and the sizes change.
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

  // The ranges differ a lot between graphs (degree 10-45 in ALL, 0-36 in GG-EU), so they
  // are recomputed each time from the current graph.
  const [dMin, dMax] = extent(cy.nodes().map((n) => n.degree()));
  cy.nodes().forEach((n) => n.data("size", scale(n.degree(), dMin, dMax, 12, 50)));
  // Thickness shows the weight on highlighted edges only: at rest they stay uniformly
  // thin, or 803 edges turn into an unreadable mass. Weights are very skewed (median 2,
  // max 22), hence the square root. The range spans the whole graph, not the
  // neighbourhood, so a given weight always looks the same across selections.
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
  cy.elements().addClass("faded").removeClass("current on"); // clear the previous highlight
  n.closedNeighborhood().removeClass("faded"); // node + neighbours + incident edges
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
  if (e.target === cy) reset(); // click on the background
});

// Native <dialog>: Esc and the Close button dismiss it, no code needed.
$("guide-open").onclick = () => $("guide").showModal();

// Click outside to close. The backdrop belongs to the dialog element itself, so compare
// against its box: a click on its padding is still inside and must not close it.
$("guide").onclick = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  if (!inside) e.currentTarget.close();
};

$("graph").onchange = (e) => show(e.target.value);
show($("graph").value);
