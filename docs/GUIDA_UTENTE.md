# Guida utente — LayerForge NFT Studio

1. **Progetto:** imposta identità, dimensioni, quantità e seed; salva un file `.layerforge` con backup.
2. **Asset:** scegli una cartella con sottocartelle numerate. Gli originali non vengono modificati; file illeggibili vengono disattivati.
3. **Rarità:** regola presenza e peso. Un peso zero esclude il tratto.
4. **Regole:** crea esclusioni, requisiti e forzature; le contraddizioni bloccano la generazione.
5. **Compositore:** registra NFT speciali 1/1 con token ID riservato.
6. **Anteprima:** genera campioni deterministici da 1 a 100 elementi.
7. **Generazione:** controlla la stima combinatoria e crea DNA unici.
8. **Metadata:** seleziona EVM, Solana, MultiversX o Cardano e verifica royalty/creator.
9. **Statistiche:** confronta conteggi e unicità.
10. **Esportazione:** scegli una destinazione nuova; l'app crea metadata, CSV, report, manifest e snapshot.

## Preparare gli asset

Usare tele della stessa dimensione, sfondo trasparente e nomi unici. Esempio: `01 Sfondo/Blu.svg`, `02 Corpo/Robot.svg`. L'ordine numerico va dal fondo al primo piano.

## Recupero

L'editor mantiene un autosalvataggio locale. Il comando Salva produce inoltre `<nome>.layerforge.backup`; rinominarlo in `.layerforge` per aprirlo.

## Limitazioni reali della versione 1.0

La composizione raster/animata e il rendering FFmpeg non sono ancora eseguiti nell'esportazione: questa versione esporta metadata e dati di collezione, ma non renderizza i file grafici finali. La modalità quantità esatta, i gruppi AND/OR, checkpoint pausa/ripresa, ZIP e modifica visuale delle trasformazioni non sono disponibili. Il build Windows da Linux può dipendere da Wine e dal download dei toolchain di electron-builder. Non viene effettuato alcun minting né upload.
