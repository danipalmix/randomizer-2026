import { useMemo, useRef, useState } from 'react';
import { formatPercent, outgoing, validateGraph } from '../core/graph';
import type { Graph, GraphEdge, GraphNode, Layer } from '../core/types';
import { Icon } from './Icon';

type Props = { graph: Graph; layers: Layer[]; selected: string | null; onSelect(id: string | null): void; onChange(graph: Graph): void; onManage(id: string): void };
const NODE_W = 154, NODE_H = 72;
export function GraphCanvas({ graph, layers, selected, onSelect, onChange, onManage }: Props) {
  const [zoom, setZoom] = useState(1); const [pan, setPan] = useState({ x: 0, y: 0 }); const [showMap, setShowMap] = useState(true); const [linkFrom, setLinkFrom] = useState<string | null>(null); const drag = useRef<{ id: string; x: number; y: number } | null>(null);
  const issues = useMemo(() => validateGraph(graph), [graph]);
  const nodeById = (id: string) => graph.nodes.find(node => node.id === id);
  const point = (node: GraphNode, side: 'left' | 'right') => ({ x: node.x + (side === 'right' ? NODE_W : 0), y: node.y + NODE_H / 2 });
  const move = (event: React.PointerEvent) => { if (!drag.current) return; const dx = event.clientX - drag.current.x, dy = event.clientY - drag.current.y; drag.current.x = event.clientX; drag.current.y = event.clientY; onChange({ ...graph, nodes: graph.nodes.map(node => node.id === drag.current?.id && !['start', 'end'].includes(node.type) ? { ...node, x: Math.max(20, node.x + dx / zoom), y: Math.max(20, node.y + dy / zoom) } : node) }); };
  const addEdge = (target: string) => { if (!linkFrom || linkFrom === target || graph.edges.some(edge => edge.source === linkFrom && edge.target === target)) { setLinkFrom(null); return; } const siblings = outgoing(graph, linkFrom); const edge: GraphEdge = { id: crypto.randomUUID(), source: linkFrom, target, probability: siblings.length ? 0 : 100 }; onChange({ ...graph, edges: [...graph.edges, edge] }); setLinkFrom(null); };
  const autoLayout = () => { const depths = new Map<string, number>([['start', 0]]); for (let pass = 0; pass < graph.nodes.length; pass++) for (const edge of graph.edges) if (depths.has(edge.source)) depths.set(edge.target, Math.max(depths.get(edge.target) ?? 0, (depths.get(edge.source) ?? 0) + 1)); const columns = new Map<number, GraphNode[]>(); graph.nodes.forEach(node => { const d = depths.get(node.id) ?? 1; columns.set(d, [...(columns.get(d) ?? []), node]); }); onChange({ ...graph, nodes: graph.nodes.map(node => { const d = depths.get(node.id) ?? 1; const column = columns.get(d) ?? []; const row = column.findIndex(entry => entry.id === node.id); return { ...node, x: 45 + d * 215, y: 45 + row * 118 }; }) }); };
  return <div className="graph-shell">
    <div className="graph-toolbar">
      <div className="tool-cluster"><button className="icon-button" title="Centra grafo" onClick={() => setPan({ x: 0, y: 0 })}><Icon name="center"/></button><button className="icon-button" title="Adatta alla schermata" onClick={() => { setZoom(.82); setPan({ x: 0, y: 0 }); }}><Icon name="fit"/></button><button className="tool-button" onClick={autoLayout}><Icon name="wand"/> Organizza</button></div>
      <div className="tool-cluster"><button className={'icon-button ' + (showMap ? 'is-active' : '')} title="Mini-mappa" onClick={() => setShowMap(!showMap)}><Icon name="grid"/></button><button className="zoom" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button></div>
    </div>
    <div className="graph-viewport" onPointerMove={move} onPointerUp={() => { drag.current = null; }} onWheel={event => { event.preventDefault(); setZoom(value => Math.min(1.35, Math.max(.55, value - event.deltaY * .001))); }} onClick={() => onSelect(null)}>
      <div className="graph-world" style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})` }}>
        <svg className="edges" width="1150" height="650" viewBox="0 0 1150 650">
          <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z"/></marker></defs>
          {graph.edges.map(edge => { const source = nodeById(edge.source), target = nodeById(edge.target); if (!source || !target) return null; const a = point(source, 'right'), b = point(target, 'left'), middle = (a.x + b.x) / 2; const d = `M${a.x} ${a.y} C${middle} ${a.y},${middle} ${b.y},${b.x} ${b.y}`; const active = selected === source.id || selected === target.id; return <g key={edge.id} className={active ? 'edge active' : 'edge'}><path d={d}/><title>Probabilità ramo: {formatPercent(edge.probability)}</title><foreignObject x={middle - 31} y={(a.y + b.y) / 2 - 14} width="62" height="28"><button className="edge-label" title={`Probabilità complessiva condizionata: ${formatPercent(edge.probability)}`} onClick={event => { event.stopPropagation(); const next = prompt('Probabilità del collegamento (%)', String(edge.probability)); if (next !== null && Number.isFinite(Number(next))) onChange({ ...graph, edges: graph.edges.map(item => item.id === edge.id ? { ...item, probability: Math.max(0, Number(next)) } : item) }); }}>{formatPercent(edge.probability)}</button></foreignObject></g>; })}
        </svg>
        {graph.nodes.map(node => { const layer = layers.find(item => item.id === node.layerId); const error = issues.some(issue => issue.kind === 'error' && issue.nodeId === node.id); const count = outgoing(graph, node.id).length; return <button key={node.id} className={`graph-node ${node.type} ${selected === node.id ? 'selected' : ''} ${error ? 'invalid' : ''} ${linkFrom === node.id ? 'linking' : ''}`} style={{ left: node.x, top: node.y }} onClick={event => { event.stopPropagation(); if (linkFrom) addEdge(node.id); else onSelect(node.id); }} onDoubleClick={() => node.type === 'layer' && onManage(node.id)} onPointerDown={event => { if (node.type === 'layer') { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { id: node.id, x: event.clientX, y: event.clientY }; } }}>
          <span className="node-icon">{node.type === 'start' ? 'S' : node.type === 'end' ? '✓' : '◇'}</span><span className="node-copy"><strong>{node.type === 'start' ? 'Start' : node.type === 'end' ? 'End' : layer?.name ?? 'Layer mancante'}</strong><small>{node.type === 'start' ? `${count} percorsi iniziali` : node.type === 'end' ? `${graph.edges.filter(edge => edge.target === node.id).length} percorsi validi` : `${layer?.traits.length ?? 0} asset · ${Math.round((layer?.presence ?? 1) * 100)}%`}</small></span>
          {node.type !== 'end' && <span className="port out" title="Crea collegamento" onClick={event => { event.stopPropagation(); setLinkFrom(node.id); }}>＋</span>}{node.type !== 'start' && <span className="port in"/>}{error && <span className="node-alert" title={issues.find(issue => issue.nodeId === node.id)?.message}>!</span>}
        </button>; })}
      </div>
      {showMap && <div className="minimap"><div className="mini-world">{graph.nodes.map(node => <i key={node.id} className={node.type} style={{ left: node.x / 7, top: node.y / 7 }}/>)}</div><span>MAPPA</span></div>}
      {linkFrom && <div className="connection-hint">Seleziona il nodo di destinazione · Esc per annullare</div>}
    </div>
  </div>;
}
