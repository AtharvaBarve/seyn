const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getLocalSongs: () => ipcRenderer.invoke('get-local-songs'),
  browseMusicFolder: () => ipcRenderer.invoke('browse-music-folder'),
  searchYouTube: (query) => ipcRenderer.invoke('search-youtube', query),
  downloadAudio: (video) => ipcRenderer.invoke('download-audio', video),
});
