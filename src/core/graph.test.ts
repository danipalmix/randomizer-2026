import { describe, expect, it } from 'vitest';
import { createDemoProject, distributeEvenly, normalizeEdges, validateGraph } from './graph';
import { seeded, walkGraph } from './engine';

describe('grafo ramificato', () => {
  it('valida il grafo obbligatorio 50/50 con tre rami e ricongiungimento', () => {
    const graph = createDemoProject().characters[0].graph;
    expect(validateGraph(graph).filter(issue => issue.kind === 'error')).toEqual([]);
    expect(graph.edges.filter(edge => edge.source === 'start').map(edge => edge.probability)).toEqual([50, 50]);
    expect(graph.edges.filter(edge => edge.source === 'background').map(edge => edge.probability)).toEqual([33.3, 33.3, 33.4]);
    expect(graph.edges.filter(edge => edge.target === 'end')).toHaveLength(4);
  });
  it('segue un solo ramo e conserva la probabilità complessiva', () => {
    const graph = createDemoProject().characters[0].graph;
    const results = Array.from({ length: 300 }, (_, index) => walkGraph(graph, seeded(`percorso-${index}`)));
    expect(results.every(result => result.path[0] === 'start' && result.path.at(-1) === 'end')).toBe(true);
    expect(results.some(result => result.path.includes('l9') && result.probability === .5)).toBe(true);
    expect(results.some(result => result.path.includes('l3') && Math.abs(result.probability - .1665) < .00001)).toBe(true);
    expect(results.every(result => result.path.filter(id => ['l3', 'l4', 'l5'].includes(id)).length <= 1)).toBe(true);
  });
  it('distribuisce e normalizza senza perdere decimali', () => {
    const edges = ['a', 'b', 'c'].map(id => ({ id, source: 's', target: id, probability: 1 }));
    expect(distributeEvenly(edges).map(edge => edge.probability)).toEqual([33.3, 33.3, 33.4]);
    expect(normalizeEdges(edges).reduce((sum, edge) => sum + edge.probability, 0)).toBe(100);
  });
  it('segnala una somma diversa da cento', () => { const graph = createDemoProject().characters[0].graph; graph.edges.find(edge => edge.id === 'e1')!.probability = 60; expect(validateGraph(graph).some(issue => issue.message.includes('invece di 100'))).toBe(true); });
});
