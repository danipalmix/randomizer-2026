# LayerForge NFT Studio

Applicazione Electron/React offline per collezioni generative. Ogni progetto v4 usa **un solo grafo persistente**: i layer attraversati vengono composti in ordine, le uscite multiple creano alternative probabilistiche e le entrate multiple convergono nello stesso percorso.

## Editor visuale

- `Start → End` viene creato automaticamente per ogni nuovo progetto;
- clic sul `+`: inserimento rapido di un nuovo layer;
- trascinamento dal `+`: collegamento manuale con anteprima;
- Start, End e layer sono liberamente spostabili, con snap opzionale;
- selezione, riconnessione, percentuale, eliminazione e menu contestuale degli archi;
- eliminazione layer con riconnessione opzionale e supporto Annulla;
- contenitori visuali nello stesso canvas, senza grafi separati;
- migrazione conservativa dei precedenti grafi per-personaggio.

## Avvio e verifica

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run build
npm run electron
```

Per produrre installer NSIS e portabile Windows:

```bash
npm run dist:win
```

Gli artefatti vengono scritti in `release/`. Dopo l'installazione non è necessaria Internet.

## Privacy e sicurezza

Nessun account, server, analytics o upload. Electron usa `contextIsolation`, sandbox, renderer senza Node, preload ristretto, navigazioni esterne bloccate, percorsi autorizzati e scritture atomiche. I progetti precedenti alla v4 ricevono un backup prima della migrazione.

Consulta la [guida utente](docs/GUIDA_UTENTE.md).
