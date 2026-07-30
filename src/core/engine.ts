import { outgoing, validateGraph } from './graph';
import { emptyGraph, newProject, type Attribute, type Character, type Graph, type Item, type Layer, type Project, type Rule, type Trait } from './types';

export class GenerationError extends Error { constructor(message: string, public diagnostics: string[] = []) { super(message); } }
export function seeded(seed: string) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pick = <T extends { weight: number }>(values: T[], random: () => number) => { const total = values.reduce((sum, value) => sum + Math.max(0, value.weight), 0); if (!total) return undefined; let cursor = random() * total; return values.find(value => (cursor -= Math.max(0, value.weight)) <= 0) ?? values.at(-1); };
function chooseEdge(graph: Graph, nodeId: string, random: () => number) { const edges = outgoing(graph, nodeId); if (!edges.length) return undefined; let cursor = random() * 100; return edges.find(edge => (cursor -= edge.probability) <= 0) ?? edges.at(-1); }
export function walkGraph(graph: Graph, random: () => number) {
  const start = graph.nodes.find(node => node.type === 'start'); if (!start) throw new GenerationError('Grafo privo di Start');
  const path = [start.id]; let probability = 1; let current = start; let guard = graph.nodes.length + 1;
  while (current.type !== 'end' && guard-- > 0) { const edge = chooseEdge(graph, current.id, random); if (!edge) throw new GenerationError('Percorso interrotto', [`Il nodo ${current.id} non ha uscite.`]); probability *= edge.probability / 100; const next = graph.nodes.find(node => node.id === edge.target); if (!next) throw new GenerationError('Collegamento non valido'); current = next; path.push(current.id); }
  if (current.type !== 'end') throw new GenerationError('Ciclo rilevato nel grafo');
  return { path, probability };
}
function rulesValid(selections: Record<string, string | null>, rules: Rule[]) { return rules.filter(rule => rule.enabled !== false).every(rule => { if (!Object.values(selections).includes(rule.ifTrait)) return true; const has = Object.values(selections).includes(rule.thenTrait); return ['exclude', 'hide'].includes(rule.type) ? !has : rule.type === 'conditional' || has; }); }
export function analyze(project: Project) {
  const contradictions: string[] = [];
  for (const rule of project.rules) if (project.rules.some(other => other.ifTrait === rule.ifTrait && other.thenTrait === rule.thenTrait && ['exclude', 'hide'].includes(rule.type) !== ['exclude', 'hide'].includes(other.type))) contradictions.push(`Regole incompatibili per ${rule.ifTrait} → ${rule.thenTrait}`);
  const graphIssues = project.characters.flatMap(character => validateGraph(character.graph).filter(issue => issue.kind === 'error').map(issue => `${character.name}: ${issue.message}`));
  const combinations = project.characters.reduce((total, character) => total + character.graph.nodes.filter(node => node.type === 'layer').reduce((amount, node) => { const layer = project.layers.find(item => item.id === node.layerId); return amount * Math.max(1, (layer?.traits.filter(trait => trait.enabled).length ?? 0) + (layer?.allowNone ? 1 : 0)); }, 1), 0);
  return { combinations, contradictions: [...new Set([...contradictions, ...graphIssues])] };
}
function selectLayer(layer: Layer, random: () => number) { if (random() > layer.presence) return null; return pick(layer.traits.filter(trait => trait.enabled), random)?.id ?? null; }
function selectedTraits(project: Project, selections: Record<string, string | null>) { return project.layers.flatMap(layer => layer.traits).filter(trait => Object.values(selections).includes(trait.id)); }
function attributeFor(project: Project, trait: Trait): Attribute { const layer = project.layers.find(item => item.traits.includes(trait)); let value: string | number = trait.value ?? trait.metadataName; if (trait.kind === 'range') value = trait.min ?? 0; return { trait_type: layer?.metadataName || layer?.name || 'Attributo', value }; }
export function generate(project: Project, count = project.size): Item[] {
  const preflight = analyze(project); if (preflight.contradictions.length) throw new GenerationError('Configurazione non valida', preflight.contradictions);
  const random = seeded(`${project.seed}|engine-v2`); const items: Item[] = []; const dnas = new Set<string>();
  for (const special of project.oneOfOnes) { const dna = `special:${special.tokenId}`; items.push({ tokenId: special.tokenId, name: special.name, characterId: '1/1', selections: {}, dna, attributes: special.attributes, path: ['special'], pathProbability: 1, appliedRules: [], special: true }); dnas.add(dna); }
  let attempts = 0;
  while (items.length < count && attempts++ < Math.max(2000, count * 200)) {
    const character = pick(project.characters, random) ?? project.characters[0]; if (!character) throw new GenerationError('Nessun gruppo disponibile');
    const walked = walkGraph(character.graph, random); const selections: Record<string, string | null> = {};
    for (const nodeId of walked.path) { const node = character.graph.nodes.find(entry => entry.id === nodeId); const layer = project.layers.find(entry => entry.id === node?.layerId); if (layer) selections[layer.id] = selectLayer(layer, random); }
    const rules = [...project.rules, ...(character.rules ?? [])];
    for (const rule of rules.filter(entry => entry.enabled !== false && ['force', 'show'].includes(entry.type))) if (Object.values(selections).includes(rule.ifTrait)) { const layer = project.layers.find(entry => entry.traits.some(trait => trait.id === rule.thenTrait)); if (layer) selections[layer.id] = rule.thenTrait; }
    for (const rule of rules.filter(entry => entry.enabled !== false && entry.type === 'hide')) if (Object.values(selections).includes(rule.ifTrait)) { const layer = project.layers.find(entry => entry.traits.some(trait => trait.id === rule.thenTrait)); if (layer) selections[layer.id] = null; }
    if (!rulesValid(selections, rules)) continue;
    const dna = [character.id, `path:${walked.path.join('>')}`, ...walked.path.map(nodeId => { const node = character.graph.nodes.find(entry => entry.id === nodeId); return node?.layerId ? `${node.layerId}:${selections[node.layerId] ?? 'none'}` : nodeId; })].join('|');
    if (dnas.has(dna)) continue; dnas.add(dna); const tokenId = nextId(project, items); const traits = selectedTraits(project, selections);
    items.push({ tokenId, name: project.nameTemplate.replace('{{collection}}', project.name).replace('{{id}}', String(tokenId)), characterId: character.id, selections, dna, path: walked.path, pathProbability: walked.probability * character.weight / Math.max(1, project.characters.reduce((sum, value) => sum + value.weight, 0)), appliedRules: rules.filter(rule => Object.values(selections).includes(rule.ifTrait)).map(rule => rule.id), attributes: [{ trait_type: 'Gruppo', value: character.name }, ...traits.map(trait => attributeFor(project, trait))] });
  }
  if (items.length < count) throw new GenerationError('Impossibile completare la collezione', [`Creati ${items.length}/${count} dopo ${attempts} tentativi.`, 'Ridurre la quantità o correggere percorsi, regole e rarità.']);
  return items.sort((a, b) => a.tokenId - b.tokenId);
}
function nextId(project: Project, items: Item[]) { let id = project.startId; const used = new Set(items.map(item => item.tokenId)); while (used.has(id)) id++; return id; }
export function migrateProject(input: Partial<Project> & { version?: number }): Project { const base = newProject(); const merged = { ...base, ...input, version: 3 as const }; merged.characters = (input.characters?.length ? input.characters : base.characters).map(character => ({ ...character, graph: character.graph ?? linearGraph(character.layerIds ?? []) })); return merged; }
function linearGraph(layerIds: string[]): Graph { const graph = emptyGraph(); graph.nodes = [graph.nodes[0], ...layerIds.map((layerId, index) => ({ id: `node-${layerId}`, type: 'layer' as const, layerId, x: 240 + index * 220, y: 260 })), { ...graph.nodes[1], x: 240 + layerIds.length * 220 }]; graph.edges = graph.nodes.slice(0, -1).map((node, index) => ({ id: `edge-${node.id}`, source: node.id, target: graph.nodes[index + 1].id, probability: 100 })); return graph; }
