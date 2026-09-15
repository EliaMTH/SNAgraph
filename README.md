# Grafo dei concetti

Visualizzazione interattiva di tre matrici di co-occorrenza sugli stessi 48 concetti
(`ALL`, `GG-EU`, `GG-CH`), con Cytoscape.js. Pagina statica, nessun build step.

Click su un nodo per evidenziarne il vicinato e aprire il pannello; click sullo sfondo
per chiudere. Rotella per lo zoom, trascinamento per spostarsi. La dimensione dei nodi
e' il degree, lo spessore degli archi il peso della co-occorrenza.

Le posizioni sono precalcolate e identiche nei tre grafi: cambiando grafo i nodi restano
fermi e il confronto e' immediato.

## File

| | |
|---|---|
| `index.html`, `style.css`, `app.js` | la pagina |
| `data.js` | **generato**, non modificare a mano |
| `build_data.py` | rigenera `data.js` da `Matrici SNA.xlsx` |

## Rigenerare i dati

Serve solo se cambia l'xlsx.

```sh
python3 -m venv .venv
.venv/bin/pip install openpyxl networkx numpy
.venv/bin/python build_data.py
```

## Pubblicare

Settings -> Pages -> branch `main`, cartella root. `index.html` e' gia' alla radice.
