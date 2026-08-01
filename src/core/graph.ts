import { newProject, type Graph, type GraphEdge, type GraphNode, type Project } from './types';

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
  project.graph = { nodes, edges: [edge('e1', 'start', 'background', 50), edge('e2', 'start', 'l9', 50), edge('e3', 'background', 'l3', 33.3), edge('e4', 'background', 'l4', 33.3), edge('e5', 'background', 'l5', 33.4), edge('e6', 'l3', 'l8'), edge('e7', 'l4', 'l7'), edge('e8', 'l5', 'l6'), edge('e9', 'l8', 'end'), edge('e10', 'l7', 'end'), edge('e11', 'l6', 'end'), edge('e12', 'l9', 'end')] };
  project.characters[0].graph = project.graph;
  return project;
}

export type AddLayerResult = { graph: Graph; layer: import('./types').Layer; nodeId: string };
export function hasPath(graph: Graph, from: string, to: string, ignoredEdgeId?: string): boolean {
  const seen = new Set<string>(); const stack = [from];
  while (stack.length) { const current = stack.pop()!; if (current === to) return true; if (seen.has(current)) continue; seen.add(current); for (const edge of outgoing(graph, current)) if (edge.id !== ignoredEdgeId) stack.push(edge.target); }
  return false;
}
export function canConnect(graph: Graph, source: string, target: string, ignoredEdgeId?: string): { valid: boolean; reason?: string } {
  const sourceNode = graph.nodes.find(node => node.id === source), targetNode = graph.nodes.find(node => node.id === target);
  if (!sourceNode || !targetNode) return { valid: false, reason: 'Nodo inesistente.' };
  if (source === target) return { valid: false, reason: 'Un nodo non può collegarsi a sé stesso.' };
  if (sourceNode.type === 'end') return { valid: false, reason: 'End non può avere uscite.' };
  if (targetNode.type === 'start') return { valid: false, reason: 'Start non può avere entrate.' };
  if (graph.edges.some(edge => edge.id !== ignoredEdgeId && edge.source === source && edge.target === target)) return { valid: false, reason: 'Collegamento già esistente.' };
  if (hasPath(graph, target, source, ignoredEdgeId)) return { valid: false, reason: 'Il collegamento creerebbe un ciclo.' };
  return { valid: true };
}
export function connectNodes(graph: Graph, source: string, target: string, edgeId = crypto.randomUUID()): Graph {
  const check = canConnect(graph, source, target); if (!check.valid) return graph;
  const existing = outgoing(graph, source); const next = [...existing, { id: edgeId, source, target, probability: existing.length ? 0 : 100 }];
  const balanced = distributeEvenly(next); return { ...graph, edges: [...graph.edges.filter(edge => edge.source !== source), ...balanced] };
}
export function reconnectEdge(graph: Graph, edgeId: string, target: string): Graph {
  const edge = graph.edges.find(item => item.id === edgeId); if (!edge || !canConnect(graph, edge.source, target, edgeId).valid) return graph;
  return { ...graph, edges: graph.edges.map(item => item.id === edgeId ? { ...item, target } : item) };
}
export function addLayerAfter(graph: Graph, layers: import('./types').Layer[], sourceId: string, mode: 'sequence' | 'branch' = 'sequence'): AddLayerResult {
  const source = graph.nodes.find(node => node.id === sourceId); if (!source || source.type === 'end') throw new Error('Origine non valida.');
  const number = layers.reduce((max, layer) => Math.max(max, Number(layer.name.match(/^Layer (\d+)$/)?.[1] ?? 0)), 0) + 1;
  const layer = { id: crypto.randomUUID(), name: `Layer ${number}`, metadataName: `Layer ${number}`, description: '', presence: 1, allowNone: false, includeMetadata: true, traits: [] };
  const nodeId = crypto.randomUUID(); const node = { id: nodeId, type: 'layer' as const, layerId: layer.id, x: source.x + 220, y: source.y + (mode === 'branch' ? 130 : 0) };
  const oldOutgoing = outgoing(graph, sourceId); let edges = graph.edges;
  if (mode === 'sequence') {
    edges = edges.filter(edge => edge.source !== sourceId);
    edges.push({ id: crypto.randomUUID(), source: sourceId, target: nodeId, probability: 100 });
    for (const edge of oldOutgoing) edges.push({ ...edge, id: crypto.randomUUID(), source: nodeId });
    if (!oldOutgoing.length) { const end = graph.nodes.find(item => item.type === 'end'); if (end) edges.push({ id: crypto.randomUUID(), source: nodeId, target: end.id, probability: 100 }); }
  } else {
    const end = graph.nodes.find(item => item.type === 'end'); edges = connectNodes({ ...graph, nodes: [...graph.nodes, node] }, sourceId, nodeId).edges; if (end) edges.push({ id: crypto.randomUUID(), source: nodeId, target: end.id, probability: 100 });
  }
  return { graph: { ...graph, nodes: [...graph.nodes, node], edges }, layer, nodeId };
}
export function deleteLayerNode(graph: Graph, nodeId: string, reconnect = true): Graph {
  const node = graph.nodes.find(item => item.id === nodeId); if (!node || node.type !== 'layer') return graph;
  const before = incoming(graph, nodeId), after = outgoing(graph, nodeId); let edges = graph.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
  if (reconnect && before.length === 1 && after.length === 1 && canConnect({ ...graph, edges }, before[0].source, after[0].target).valid) edges.push({ id: crypto.randomUUID(), source: before[0].source, target: after[0].target, probability: before[0].probability });
  return { ...graph, nodes: graph.nodes.filter(item => item.id !== nodeId), edges };
}
export function moveNode(graph: Graph, nodeId: string, x: number, y: number, snap = false): Graph { const grid = 20; return { ...graph, nodes: graph.nodes.map(node => node.id === nodeId ? { ...node, x: snap ? Math.round(x / grid) * grid : x, y: snap ? Math.round(y / grid) * grid : y } : node) }; }
export function edgePath(source: GraphNode, target: GraphNode, nodeWidth = 154, nodeHeight = 72) { const ax = source.x + nodeWidth, ay = source.y + nodeHeight / 2, bx = target.x, by = target.y + nodeHeight / 2, middle = (ax + bx) / 2; return `M${ax} ${ay} C${middle} ${ay},${middle} ${by},${bx} ${by}`; }
