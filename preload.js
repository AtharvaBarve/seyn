const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getLocalSongs: () => ipcRenderer.invoke('get-local-songs'),
  browseFolder: () => ipcRenderer.invoke('browse-music-folder'),
  searchYouTube: (query) => ipcRenderer.invoke('search-youtube', query),
  downloadAndPlay: (video) => ipcRenderer.invoke('download-audio', video),
});
