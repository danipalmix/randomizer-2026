import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const css = readFileSync(new URL('./style.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const organize = readFileSync(new URL('./components/Organize.tsx', import.meta.url), 'utf8');
describe('contratto visuale', () => {
  it('centralizza token, focus accessibile e responsive layout', () => { expect(css).toContain('--accent:'); expect(css).toContain(':focus-visible'); expect(css).toContain('@media(max-width:1360px)'); expect(css).toContain('@media(max-width:1120px)'); });
  it('espone sempre le quattro fasi e lo stato offline', () => { for (const label of ['Impostazioni', 'Organizza', 'Anteprima', 'Esporta', 'Offline']) expect(app).toContain(label); });
  it('include controlli professionali del grafo', () => { for (const label of ['Modalità avanzata', 'Anteprima rapida', 'Distribuisci equamente', 'Normalizza a 100%', 'Aggiungi asset personalizzato']) expect(organize).toContain(label); });
});
