import type { Layer, Trait } from './core/types';
declare global { interface Window { layerforge?: { openProject(): Promise<{ file: string; data: unknown } | null>; saveProject(data: unknown): Promise<string | null>; importAssets(): Promise<Layer[] | null>; addFiles(files: File[]): Promise<Trait[]>; chooseFiles(): Promise<Trait[] | null>; exportCollection(data: unknown): Promise<string | null>; platform: string } } }
export {};
