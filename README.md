# SNAgraph - Grafo dei concetti interattivo

Visualizzazione interattiva di tre matrici di co-occorrenza sugli stessi 48 concetti
(`ALL`, `GG-EU`, `GG-CH`), con Cytoscape.js. Pagina statica, nessun build step. La creazione di `data.js` è fatta con uno script python.

Click su un nodo per evidenziarne il vicinato e aprire il pannello; click sullo sfondo
per chiudere. Rotella per lo zoom, trascinamento per spostarsi. La dimensione dei nodi
e' il degree, lo spessore degli archi il peso della co-occorrenza.

Le posizioni sono precalcolate e identiche nei tre grafi.

[Pubblicato su GitHub Pages.](https://eliamth.github.io/SNAgraph/)

## File

| | |
|---|---|
| `index.html`, `style.css`, `app.js` | la pagina |
| `data.js` | **generato** da `build_data.py`, non modificare a mano |
| `build_data.py` | rigenera `data.js` da `Matrici SNA.xlsx` |

## Rigenerare i dati

Serve solo se cambia l'xlsx.

```sh
python3 -m venv .venv
.venv/bin/pip install openpyxl networkx numpy
.venv/bin/python build_data.py
```