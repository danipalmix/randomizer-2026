# LayerForge NFT Studio

LayerForge è uno studio desktop **offline, senza account e senza telemetria** per creare collezioni generative. Il flusso italiano in quattro fasi — Impostazioni, Organizza, Anteprima, Esporta — combina un grafo probabilistico ramificato, regole, DNA deterministico, rendering Sharp e metadata multichain.

## Funzioni principali

- grafo persistente con diramazioni, convergenze, percentuali modificabili e normalizzazione esatta;
- gruppi/personaggi con peso, colore, grafo e regole indipendenti;
- modalità semplice lineare e modalità avanzata senza perdita di dati;
- import di PNG, WebP, JPEG, SVG, GIF e MP4 tramite selezione o drag-and-drop;
- asset metadata-only testuali, numerici, percentuali, intervalli e valori fissi;
- anteprima rapida con percorso, probabilità complessiva, regole, trait e JSON;
- generazione deterministica con seed, percorsi nel DNA e controllo duplicati;
- profili EVM/OpenSea, Solana/Metaplex, MultiversX e Cardano CIP-25;
- rendering PNG/WebP/JPEG, CSV, report percorsi, checksum SHA-256, manifest e snapshot.

## Avvio

```bash
npm install
npm run dev       # interfaccia web, filesystem nativo disabilitato
npm run electron  # applicazione desktop completa
```

## Verifica e distribuzione Windows

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run dist:win
```

Gli installer NSIS e portabile vengono generati in `release/`. Dopo l'installazione non è richiesta alcuna connessione Internet.

## Sicurezza

Electron usa `contextIsolation`, sandbox, renderer senza Node, blocco di navigazioni esterne e un preload ristretto. I percorsi sono autorizzati solo dopo una selezione esplicita; i progetti usano scrittura atomica e backup. Nessun dato viene trasmesso.

Consulta la [guida utente italiana](docs/GUIDA_UTENTE.md).
