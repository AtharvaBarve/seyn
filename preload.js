const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getLocalSongs: () => ipcRenderer.invoke('get-local-songs'),
  searchYouTube: (query) => ipcRenderer.invoke('search-youtube', query),
  downloadAudio: (video) => ipcRenderer.invoke('download-audio', video),
});
