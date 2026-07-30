import{contextBridge,ipcRenderer}from'electron';
contextBridge.exposeInMainWorld('layerforge',{openProject:()=>ipcRenderer.invoke('project:open'),saveProject:(data:unknown)=>ipcRenderer.invoke('project:save',data),importAssets:()=>ipcRenderer.invoke('assets:import'),exportCollection:(payload:unknown)=>ipcRenderer.invoke('collection:export',payload),platform:process.platform});
