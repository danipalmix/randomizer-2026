import { newProject, type Project } from './types';
export type NewProjectWorkflow = { project: Project; phase: 'organize'; selectedNode: 'start'; hint: string };
export function createNewProjectWorkflow(): NewProjectWorkflow {
  const project = newProject();
  return { project, phase: 'organize', selectedNode: 'start', hint: 'Premi + per aggiungere il primo layer' };
}
