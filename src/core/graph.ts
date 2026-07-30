import { newProject, type Graph, type GraphEdge, type Project } from './types';

export type GraphIssue = { kind: 'error' | 'warning'; message: string; nodeId?: string };
const EPSILON = 0.011;

export function outgoing(graph: Graph, nodeId: string) { return graph.edges.filter(edge => edge.source === nodeId); }
export function incoming(graph: Graph, nodeId: string) { return graph.edges.filter(edge => edge.target === nodeId); }

export function validateGraph(graph: Graph): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const starts = graph.nodes.filter(node => node.type === 'start');
  const ends = graph.nodes.filter(node => node.type === 'end');
  if (starts.length !== 1) issues.push({ kind: 'error', message: 'Il grafo deve contenere esattamente un nodo Start.' });
  if (ends.length !== 1) issues.push({ kind: 'error', message: 'Il grafo deve contenere esattamente un nodo End.' });
  const ids = new Set(graph.nodes.map(node => node.id));
  for (const edge of graph.edges) if (!ids.has(edge.source) || !ids.has(edge.target)) issues.push({ kind: 'error', message: `Collegamento ${edge.id} non valido.` });
  for (const node of graph.nodes) {
    const edges = outgoing(graph, node.id);
    if (node.type !== 'end' && edges.length === 0) issues.push({ kind: 'error', nodeId: node.id, message: 'Questo nodo non conduce a End.' });
    if (edges.length) {
      const sum = edges.reduce((total, edge) => total + edge.probability, 0);
      if (Math.abs(sum - 100) > EPSILON) issues.push({ kind: 'error', nodeId: node.id, message: `Le uscite sommano ${formatPercent(sum)} invece di 100%.` });
      if (edges.some(edge => edge.probability < 0)) issues.push({ kind: 'error', nodeId: node.id, message: 'Le probabilità non possono essere negative.' });
    }
  }
  if (starts[0]) {
    const reachable = new Set<string>(); const visiting = new Set<string>();
    const visit = (id: string) => {
      if (visiting.has(id)) { issues.push({ kind: 'error', nodeId: id, message: 'Il grafo contiene un ciclo.' }); return; }
      if (reachable.has(id)) return; visiting.add(id); reachable.add(id);
      outgoing(graph, id).forEach(edge => visit(edge.target)); visiting.delete(id);
    };
    visit(starts[0].id);
    for (const node of graph.nodes) if (!reachable.has(node.id)) issues.push({ kind: 'warning', nodeId: node.id, message: 'Nodo irraggiungibile da Start.' });
    if (ends[0] && !reachable.has(ends[0].id)) issues.push({ kind: 'error', nodeId: ends[0].id, message: 'End non è raggiungibile.' });
  }
  return issues;
}

export function distributeEvenly(edges: GraphEdge[]): GraphEdge[] {
  if (!edges.length) return edges;
  const base = Math.floor(1000 / edges.length) / 10;
  let remaining = Math.round((100 - base * edges.length) * 10);
  return edges.map((edge, index) => ({ ...edge, probability: base + (index === edges.length - 1 ? remaining / 10 : 0) }));
}
export function normalizeEdges(edges: GraphEdge[]): GraphEdge[] {
  const total = edges.reduce((sum, edge) => sum + Math.max(0, edge.probability), 0);
  if (!total) return distributeEvenly(edges);
  const values = edges.map(edge => Math.floor(Math.max(0, edge.probability) / total * 1000) / 10);
  const difference = Math.round((100 - values.reduce((sum, value) => sum + value, 0)) * 10) / 10;
  return edges.map((edge, index) => ({ ...edge, probability: values[index] + (index === edges.length - 1 ? difference : 0) }));
}
export const formatPercent = (value: number) => `${new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 }).format(value)}%`;

export function createDemoProject(): Project {
  const project = (globalThis as { structuredClone?: <T>(value: T) => T }).structuredClone
    ? structuredClone((newProject())) : JSON.parse(JSON.stringify(newProject())) as Project;
  const specs = ['Background', 'Layer 3', 'Layer 8', 'Layer 4', 'Layer 7', 'Layer 5', 'Layer 6', 'Layer 9'];
  project.layers = specs.map((name, index) => ({ id: `layer-${index + 1}`, name, metadataName: name, presence: 1, allowNone: false, includeMetadata: true, traits: ['Base', 'Aurora', 'Notte'].map((variant, traitIndex) => ({ id: `trait-${index + 1}-${traitIndex + 1}`, name: `${name} · ${variant}`, metadataName: variant, weight: 1, enabled: true })) }));
  const nodes = [
    { id: 'start', type: 'start' as const, x: 40, y: 250 }, { id: 'background', type: 'layer' as const, layerId: 'layer-1', x: 230, y: 120 },
    { id: 'l3', type: 'layer' as const, layerId: 'layer-2', x: 430, y: 40 }, { id: 'l8', type: 'layer' as const, layerId: 'layer-3', x: 650, y: 40 },
    { id: 'l4', type: 'layer' as const, layerId: 'layer-4', x: 430, y: 170 }, { id: 'l7', type: 'layer' as const, layerId: 'layer-5', x: 650, y: 170 },
    { id: 'l5', type: 'layer' as const, layerId: 'layer-6', x: 430, y: 300 }, { id: 'l6', type: 'layer' as const, layerId: 'layer-7', x: 650, y: 300 },
    { id: 'l9', type: 'layer' as const, layerId: 'layer-8', x: 430, y: 430 }, { id: 'end', type: 'end' as const, x: 890, y: 250 }
  ];
  const edge = (id: string, source: string, target: string, probability = 100) => ({ id, source, target, probability });
  project.characters[0].layerIds = project.layers.map(layer => layer.id);
  project.characters[0].graph = { nodes, edges: [edge('e1', 'start', 'background', 50), edge('e2', 'start', 'l9', 50), edge('e3', 'background', 'l3', 33.3), edge('e4', 'background', 'l4', 33.3), edge('e5', 'background', 'l5', 33.4), edge('e6', 'l3', 'l8'), edge('e7', 'l4', 'l7'), edge('e8', 'l5', 'l6'), edge('e9', 'l8', 'end'), edge('e10', 'l7', 'end'), edge('e11', 'l6', 'end'), edge('e12', 'l9', 'end')] };
  return project;
}
