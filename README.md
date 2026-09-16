# SNAgraph - Interactive concept graph

Interactive visualisation of three co-occurrence matrices over the same 48 concepts
(`ALL`, `GG-EU`, `GG-CH`), built with Cytoscape.js. Static page, no build step. `data.js`
is produced by a Python script.

Click a node to highlight its neighbourhood and open the side panel; click the background
to close it. Scroll to zoom, drag to pan. Node size is the degree; on the selected node's
edges, thickness is the co-occurrence weight.

Node positions are precomputed and identical across the three graphs.

[Published on GitHub Pages.](https://eliamth.github.io/SNAgraph/)

## Files

| | |
|---|---|
| `index.html`, `style.css`, `app.js` | the page |
| `data.js` | **generated** by `build_data.py`, do not edit by hand |
| `build_data.py` | regenerates `data.js` from `Matrici SNA.xlsx` |

## Regenerating the data

Only needed when the xlsx changes.

```sh
python3 -m venv .venv
.venv/bin/pip install openpyxl networkx numpy
.venv/bin/python build_data.py
```
