import{app,BrowserWindow,dialog,ipcMain}from'electron';import path from'node:path';import fs from'node:fs/promises';import crypto from'node:crypto';import sharp from'sharp';
const allowedExt=new Set(['.png','.webp','.jpg','.jpeg','.gif','.svg','.mp4']);let roots=new Set<string>();
const safe=(candidate:string)=>{const resolved=path.resolve(candidate);if(![...roots].some(r=>resolved===r||resolved.startsWith(r+path.sep)))throw new Error('Percorso non autorizzato');return resolved};
async function atomic(file:string,data:string){safe(file);const temp=`${file}.${crypto.randomUUID()}.tmp`;await fs.writeFile(temp,data);await fs.rename(temp,file)}
function createWindow(){const win=new BrowserWindow({width:1440,height:900,minWidth:1080,minHeight:700,backgroundColor:'#101525',webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,preload:path.join(__dirname,'preload.js')}});win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());if(process.env.VITE_DEV_SERVER_URL)win.loadURL(process.env.VITE_DEV_SERVER_URL);else win.loadFile(path.join(__dirname,'../dist/index.html'))}
app.whenReady().then(createWindow);app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
ipcMain.handle('project:open',async()=>{const r=await dialog.showOpenDialog({filters:[{name:'Progetto LayerForge',extensions:['layerforge','json']}],properties:['openFile']});if(r.canceled)return null;const file=r.filePaths[0];roots.add(path.dirname(file));return{file,data:JSON.parse(await fs.readFile(file,'utf8'))}});
ipcMain.handle('project:save',async(_e,data)=>{const r=await dialog.showSaveDialog({defaultPath:'progetto.layerforge',filters:[{name:'Progetto LayerForge',extensions:['layerforge']}]});if(r.canceled||!r.filePath)return null;roots.add(path.dirname(r.filePath));await atomic(r.filePath,JSON.stringify(data,null,2));await fs.copyFile(r.filePath,`${r.filePath}.backup`);return r.filePath});
ipcMain.handle('assets:import',async()=>{const r=await dialog.showOpenDialog({properties:['openDirectory']});if(r.canceled)return null;const root=r.filePaths[0];roots.add(root);const dirs=(await fs.readdir(root,{withFileTypes:true})).filter(x=>x.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));const layers=[];for(const dir of dirs){const folder=safe(path.join(root,dir.name));const files=(await fs.readdir(folder,{withFileTypes:true})).filter(x=>x.isFile()&&allowedExt.has(path.extname(x.name).toLowerCase()));const traits=[];for(const file of files){const full=safe(path.join(folder,file.name));let warning='';if(path.extname(full)!=='.mp4')try{const m=await sharp(full,{animated:true}).metadata();warning=m.width&&m.height?`${m.width}×${m.height}`:'Formato leggibile'}catch{warning='File non leggibile'}traits.push({id:crypto.randomUUID(),name:path.parse(file.name).name,metadataName:path.parse(file.name).name,path:full,weight:1,enabled:warning!=='File non leggibile',warning})}layers.push({id:crypto.randomUUID(),name:dir.name.replace(/^\d+[ _-]*/,''),presence:1,allowNone:false,traits})}return layers});
ipcMain.handle('collection:export', async (_event, payload: any) => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] }); if (result.canceled) return null;
  const out = path.join(result.filePaths[0], `LayerForge-${Date.now()}`); roots.add(out);
  for (const directory of ['assets', 'metadata', 'csv', 'reports', 'project']) await fs.mkdir(path.join(out, directory), { recursive: true });
  const rows = ['tokenId,nome,file,uri,dna,percorso,probabilita']; const checksums: Record<string, string> = {};
  for (const item of payload.items) {
    const extension = payload.project.format === 'jpeg' ? 'jpg' : payload.project.format; const filename = `${item.tokenId}.${extension}`; const outputPath = path.join(out, 'assets', filename);
    const inputPaths: string[] = Object.entries(item.selections).flatMap(([layerId, traitId]) => { const layer = payload.project.layers.find((entry: any) => entry.id === layerId); const trait = layer?.traits.find((entry: any) => entry.id === traitId); return trait?.path && trait.kind !== 'text' ? [trait.path] : []; });
    let image = sharp({ create: { width: payload.project.width, height: payload.project.height, channels: 4, background: payload.project.background === 'transparent' ? { r: 0, g: 0, b: 0, alpha: 0 } : payload.project.background } });
    if (inputPaths.length) image = image.composite(inputPaths.map(input => ({ input, gravity: 'center' })));
    if (payload.project.format === 'jpeg') image = image.jpeg({ quality: payload.project.quality }); else if (payload.project.format === 'webp') image = image.webp({ quality: payload.project.quality }); else image = image.png({ compressionLevel: Math.round((100 - payload.project.quality) / 11) });
    await image.toFile(outputPath); const assetData = await fs.readFile(outputPath); checksums[`assets/${filename}`] = crypto.createHash('sha256').update(assetData).digest('hex');
    const meta = payload.metadata.find((entry: any) => entry.tokenId === item.tokenId)?.data; const metaPath = path.join(out, 'metadata', `${item.tokenId}.json`); await atomic(metaPath, JSON.stringify(meta, null, 2)); checksums[`metadata/${item.tokenId}.json`] = crypto.createHash('sha256').update(JSON.stringify(meta, null, 2)).digest('hex');
    rows.push(`${item.tokenId},"${item.name.replaceAll('"', '""')}",${filename},${meta?.image ?? ''},"${item.dna}","${item.path.join('>')}",${item.pathProbability}`);
  }
  await atomic(path.join(out, 'csv', 'collection.csv'), rows.join('\n')); await atomic(path.join(out, 'metadata', 'all.json'), JSON.stringify(payload.metadata.map((entry: any) => entry.data), null, 2));
  await atomic(path.join(out, 'reports', 'validation-report.json'), JSON.stringify({ valid: !payload.errors.length, errors: payload.errors }, null, 2)); await atomic(path.join(out, 'reports', 'path-report.json'), JSON.stringify(payload.pathReport ?? [], null, 2));
  await atomic(path.join(out, 'reports', 'checksums-sha256.json'), JSON.stringify(checksums, null, 2)); await atomic(path.join(out, 'reports', 'generation-manifest.json'), JSON.stringify({ engine: '2', seed: payload.project.seed, createdAt: new Date().toISOString(), items: payload.items.length, checksums }, null, 2));
  await atomic(path.join(out, 'project', 'project-snapshot.json'), JSON.stringify(payload.project, null, 2)); return out;
});
const inspectFiles = async (paths: string[]) => {
  const expanded: string[] = [];
  for (const raw of paths) { const stat = await fs.stat(raw).catch(() => null); if (stat?.isDirectory()) { for (const entry of await fs.readdir(raw, { withFileTypes: true })) if (entry.isFile()) expanded.push(path.join(raw, entry.name)); } else expanded.push(raw); }
  const assets = [];
  for (const raw of expanded) {
    const full = path.resolve(raw); roots.add(path.dirname(full));
    if (!allowedExt.has(path.extname(full).toLowerCase())) continue;
    let warning = ''; let width: number | undefined; let height: number | undefined;
    if (path.extname(full).toLowerCase() !== '.mp4') try { const meta = await sharp(full, { animated: true }).metadata(); width = meta.width; height = meta.height; warning = width && height ? `${width}×${height}` : 'Formato leggibile'; } catch { warning = 'File non leggibile'; }
    assets.push({ id: crypto.randomUUID(), name: path.parse(full).name, metadataName: path.parse(full).name, path: full, weight: 1, enabled: warning !== 'File non leggibile', kind: 'image', warning, width, height });
  }
  return assets;
};
ipcMain.handle('assets:choose-files', async () => { const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Asset', extensions: ['png', 'webp', 'jpg', 'jpeg', 'svg', 'gif', 'mp4'] }] }); return result.canceled ? null : inspectFiles(result.filePaths); });
ipcMain.handle('assets:add-files', async (_event, paths: string[]) => inspectFiles(paths));
