# LayerForge NFT Studio

Applicazione desktop **offline e senza account** per progettare collezioni generative. L'interfaccia italiana guida attraverso progetto, asset, rarità, regole, composizione 1/1, anteprima, generazione, metadata, statistiche ed esportazione.

## Avvio sviluppo

```bash
npm install
npm run dev
```

Nel browser le operazioni native di filesystem sono disabilitate; usare `npm run electron` per importare, salvare ed esportare.

## Verifica e distribuzione

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run dist:win
```

Gli artefatti Windows (installer NSIS e portabile) vengono creati in `release/`. L'app compilata non richiede Internet e non contiene telemetria, analytics, login, wallet o upload automatici.

## Sicurezza e privacy

Electron usa isolamento del contesto, renderer senza Node, sandbox, preload con quattro sole operazioni autorizzate e verifica delle radici selezionate. I progetti sono salvati atomicamente con backup affiancato. Nessun dato viene trasmesso.

## Formati e profili

Import: PNG, WebP, JPEG, SVG, GIF e MP4. Export immagini configurabile PNG/WebP/JPEG; metadata EVM/OpenSea, Solana/Metaplex, MultiversX e Cardano CIP-25; CSV, metadata aggregati, report, manifest e snapshot.

Consulta [la guida italiana](docs/GUIDA_UTENTE.md) per il flusso completo e le limitazioni dichiarate.
