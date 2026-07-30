# Guida utente — LayerForge NFT Studio

## 1. Impostazioni

Definisci nome, simbolo, descrizione, quantità, ID iniziale, tela, seed, formato e profilo blockchain. **Salva** crea un file `.layerforge` e un backup affiancato. Annulla e Ripristina conservano le ultime 30 modifiche; l'autosalvataggio locale protegge dagli arresti.

## 2. Organizza

Le schede superiori rappresentano gruppi o personaggi. `+` crea un grafo indipendente; i comandi accanto allo stato del grafo rinominano, duplicano o eliminano il gruppo.

Seleziona un nodo layer e trascina file o una cartella nella dropzone. “Asset personalizzato” crea un trait senza immagine, presente soltanto nei metadata. “Gestisci” apre dettagli, rarità, asset e tabella delle regole.

### Grafo avanzato

Il progetto demo contiene il caso completo:

- Start → Background al 50%;
- Background → tre rami al 33,3%, 33,3% e 33,4%;
- ciascun ramo attraversa due layer;
- Start → Layer 9 al 50%;
- tutti e quattro i percorsi convergono in End.

Premi `+` sulla porta destra di un nodo e poi il nodo destinazione per creare un collegamento. Seleziona un nodo per modificare le sue uscite; **Distribuisci equamente** gestisce il resto decimale e **Normalizza a 100%** conserva i rapporti. Una somma errata blocca la generazione.

Il canvas supporta trascinamento dei nodi, zoom con rotella, mini-mappa, centratura, adattamento e layout automatico. Il doppio clic apre la gestione layer. “Anteprima rapida” mostra il solo percorso estratto, probabilità complessiva, regole e metadata.

### Modalità semplice

Disattiva “Modalità avanzata” per una lista ordinata. Se esistono diramazioni la lista rimane consultabile in sola lettura, senza eliminare alcun dato.

## 3. Anteprima

Genera 1, 10, 25, 50 o 100 campioni. La galleria e il pannello dettagli mostrano token, probabilità, percorso, attributi e JSON. Lo stesso progetto e seed producono lo stesso risultato.

## 4. Esporta

Il controllo preliminare verifica grafo, regole e metadata. L'esportazione crea immagini composte con Sharp, JSON singoli e aggregati, CSV, rapporto percorsi, validazione, checksum, manifest e snapshot. Il nome e l'estensione URI coincidono con il file renderizzato.

## Preparare gli asset

Usa tele della stessa dimensione e trasparenza. Ordina le cartelle dal fondo al primo piano (`01 Sfondo`, `02 Corpo`). SVG viene rasterizzato da Sharp senza eseguire script. Gli originali non vengono modificati.

## Limiti dichiarati

Il rendering statico PNG/WebP/JPEG è operativo. La composizione temporale di GIF/WebP animate/MP4 con FFmpeg, le quantità esatte con solver globale, la selezione multipla del canvas e la creazione ZIP non sono ancora disponibili. L'export produce una cartella completa. Il minting e gli upload restano intenzionalmente esterni e manuali.
