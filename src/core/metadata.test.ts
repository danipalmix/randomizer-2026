import { expect, it } from 'vitest';
import { metadata, replaceUriPrefix, validateMetadata } from './metadata';
import { newProject, type Item } from './types';
const item: Item = { tokenId: 1, name: 'NFT #1', characterId: 'x', selections: {}, dna: 'x', path: ['start', 'end'], pathProbability: 1, appliedRules: [], attributes: [{ trait_type: 'Power', value: 10, display_type: 'boost_number' }] };
it('genera EVM mantenendo numeri', () => { const result = metadata(newProject(), item) as { image: string; attributes: { value: number }[] }; expect(result.attributes[0].value).toBe(10); expect(result.image).toContain('/1.png'); });
it('valida creator Solana', () => { const project = { ...newProject(), profile: 'solana' as const, creators: [{ address: 'x', share: 90 }] }; expect(validateMetadata(project, [item])).toContain('Creator: le quote devono sommare a 100'); });
it('sostituisce prefissi URI', () => expect(replaceUriPrefix([{ image: 'ipfs://old/1' }], 'ipfs://old', 'ipfs://new')).toEqual([{ image: 'ipfs://new/1' }]));
