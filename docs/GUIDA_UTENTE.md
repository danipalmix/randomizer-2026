# Guida utente — LayerForge NFT Studio

## 1. Impostazioni

**Nuovo** crea un progetto v4, inizializza `Start → End`, apre automaticamente Organizza, centra il canvas e seleziona Start. Salva produce un file `.layerforge` con backup; Annulla e Ripristina conservano le modifiche del grafo.

## 2. Organizza: un solo grafo

Ogni progetto possiede un unico canvas persistente. I nodi attraversati sono i layer combinati, più uscite sono alternative probabilistiche, più entrate ricongiungono i percorsi ed End conclude l'NFT.

- Trascina l'area centrale di Start, End o di un layer per spostarlo liberamente.
- Un clic breve sul `+` inserisce un layer in sequenza e apre Gestisci.
- Trascina il `+` per collegarlo al punto di ingresso di un altro nodo.
- Seleziona una linea per modificarne percentuale o destinazione; Canc la elimina.
- Il comando `−`, Canc o il menu contestuale eliminano un layer e possono ricollegare i vicini.
- **Snap** attiva o disattiva l'allineamento alla griglia.
- **Organizza automaticamente** è l'unico comando che riposiziona più nodi.

I contenitori colorati sono soltanto etichette visuali nello stesso canvas: possono essere rinominati, duplicati o eliminati senza aprire altri editor.

### Come funziona

1. `Start → Background → Body → Eyes → End`: tutti i layer vengono combinati.
2. `Body → Hat → End` e `Body → End`: Hat è opzionale secondo le percentuali.
3. `Start → Human Body → Eyes → End` oppure `Start → Robot Body → Eyes → End`: viene scelta una variante e poi il percorso converge.

La modalità semplice mostra la sequenza lineare; con diramazioni diventa una vista di sola lettura e non perde dati.

## Migrazione

I progetti v3 con grafi separati vengono uniti automaticamente. Asset, rarità e regole restano invariati; i vecchi gruppi diventano contenitori visuali. Un avviso segnala i collegamenti da revisionare. Il file originale resta protetto dal backup creato al successivo salvataggio.

## 3. Anteprima

L'anteprima usa lo stesso grafo del motore ed espone percorso, probabilità, attributi, regole e JSON. Lo stesso seed riproduce percorso e DNA.

## 4. Esporta

L'export crea immagini PNG/WebP/JPEG con Sharp, metadata, CSV, rapporto percorsi, validazione, checksum, manifest e snapshot del grafo.

## Limiti dichiarati

La composizione temporale FFmpeg, il solver globale per quantità esatte, la selezione multipla e ZIP non sono ancora disponibili. Minting e upload restano intenzionalmente esterni.
