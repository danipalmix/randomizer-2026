import { describe, expect, it } from 'vitest';
import { analyze, generate, GenerationError, migrateProject } from './engine';
import { createDemoProject } from './graph';

describe('motore deterministico', () => {
  it('riproduce seed, percorso e DNA unici', () => { const project = createDemoProject(); project.size = 8; const first = generate(project), second = generate(project); expect(first.map(item => item.dna)).toEqual(second.map(item => item.dna)); expect(new Set(first.map(item => item.dna)).size).toBe(8); });
  it('applica esclusioni ai trait attraversati', () => { const project = createDemoProject(); project.size = 4; project.rules = [{ id: 'r', type: 'exclude', ifTrait: 'trait-1-1', thenTrait: 'trait-2-1', enabled: true }]; expect(generate(project).every(item => !(item.dna.includes('trait-1-1') && item.dna.includes('trait-2-1')))).toBe(true); });
  it('rileva un grafo impossibile', () => { const project = createDemoProject(); project.graph.edges.find(edge => edge.id === 'e1')!.probability = 90; expect(analyze(project).contradictions.length).toBeGreaterThan(0); expect(() => generate(project)).toThrow(GenerationError); });
  it('inserisce NFT 1/1 riservati', () => { const project = createDemoProject(); project.oneOfOnes = [{ tokenId: 1, name: 'Unico', description: '', attributes: [] }]; expect(generate(project)[0].special).toBe(true); });
  it('migra i grafi separati in un unico grafo senza perdere layer', () => { const project = createDemoProject(); const { graph: _rootGraph, visualGroups: _groups, ...legacy } = project; const migrated = migrateProject({ ...legacy, version: 3 as never }); expect(migrated.version).toBe(4); expect(migrated.graph.nodes.length).toBeGreaterThan(2); expect(migrated.characters.every(character => character.graph === migrated.graph)).toBe(true); });
});
