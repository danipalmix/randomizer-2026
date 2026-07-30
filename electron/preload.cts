import { contextBridge, ipcRenderer, webUtils } from 'electron';
contextBridge.exposeInMainWorld('layerforge', {
  openProject: () => ipcRenderer.invoke('project:open'),
  saveProject: (data: unknown) => ipcRenderer.invoke('project:save', data),
  importAssets: () => ipcRenderer.invoke('assets:import'),
  addFiles: (files: File[]) => ipcRenderer.invoke('assets:add-files', files.map(file => webUtils.getPathForFile(file))),
  chooseFiles: () => ipcRenderer.invoke('assets:choose-files'),
  exportCollection: (payload: unknown) => ipcRenderer.invoke('collection:export', payload),
  platform: process.platform
});
