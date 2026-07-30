export type TraitKind = 'image' | 'text' | 'number' | 'range' | 'percentage' | 'fixed';
export type Trait = {
  id: string; name: string; metadataName: string; path?: string; previewUrl?: string;
  kind?: TraitKind; value?: string | number; min?: number; max?: number;
  weight: number; enabled: boolean; exact?: number;
  transform?: { x: number; y: number; scale: number; rotation: number; opacity: number; blend: string };
};
export type Layer = {
  id: string; name: string; metadataName?: string; description?: string; presence: number;
  allowNone: boolean; includeMetadata?: boolean; exact?: number; traits: Trait[];
};
export type RuleType = 'exclude' | 'require' | 'force' | 'show' | 'hide' | 'onlyWith' | 'conditional';
export type Rule = { id: string; type: RuleType; ifTrait: string; thenTrait: string; scope?: 'group' | 'project'; enabled?: boolean; multiplier?: number };
export type GraphNodeType = 'start' | 'layer' | 'end';
export type GraphNode = { id: string; type: GraphNodeType; layerId?: string; x: number; y: number };
export type GraphEdge = { id: string; source: string; target: string; probability: number };
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };
export type Character = {
  id: string; name: string; weight: number; exact?: number; color?: string;
  layerIds: string[]; sharedLayerIds?: string[]; graph: Graph; rules?: Rule[];
};
export type Attribute = { trait_type: string; value: string | number; display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date' };
export type OneOfOne = { tokenId: number; name: string; description: string; assetPath?: string; attributes: Attribute[] };
export type Project = {
  version: 3; name: string; description: string; symbol: string; externalUrl: string; size: number;
  startId: 0 | 1; nameTemplate: string; width: number; height: number; background: string;
  format: 'png' | 'webp' | 'jpeg'; quality: number; seed: string;
  profile: 'evm' | 'solana' | 'multiversx' | 'cardano'; imageUri: string; animationUri: string; metadataUri: string;
  layers: Layer[]; rules: Rule[]; characters: Character[]; oneOfOnes: OneOfOne[];
  royaltyBps: number; creators: { address: string; share: number }[]; policyId: string;
};
export type Item = {
  tokenId: number; name: string; characterId: string; selections: Record<string, string | null>;
  dna: string; attributes: Attribute[]; path: string[]; pathProbability: number; appliedRules: string[]; special?: boolean;
};
export const emptyGraph = (): Graph => ({ nodes: [{ id: 'start', type: 'start', x: 60, y: 260 }, { id: 'end', type: 'end', x: 920, y: 260 }], edges: [] });
export const newProject = (): Project => ({
  version: 3, name: 'Nebula Atelier', description: 'Una collezione originale creata offline.', symbol: 'NEB', externalUrl: '', size: 25,
  startId: 1, nameTemplate: '{{collection}} #{{id}}', width: 1000, height: 1000, background: '#101525', format: 'png', quality: 90,
  seed: 'layerforge-2026', profile: 'evm', imageUri: 'ipfs://CID_IMMAGINI', animationUri: '', metadataUri: 'ipfs://CID_METADATA',
  layers: [], rules: [], characters: [{ id: 'default', name: 'Default', weight: 100, color: '#5eead4', layerIds: [], graph: emptyGraph(), rules: [] }],
  oneOfOnes: [], royaltyBps: 500, creators: [], policyId: ''
});
