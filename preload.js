const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  searchYouTube: (query, source = 'youtube-music') => ipcRenderer.invoke('search-youtube', query, source),
  downloadAudio: (video) => ipcRenderer.invoke('download-audio', video),
  getLocalSongs: () => ipcRenderer.invoke('get-local-songs'),
  browseMusicFolder: () => ipcRenderer.invoke('browse-music-folder'),
  clearCache: () => ipcRenderer.invoke('clear-cache'),
  getCacheFiles: () => ipcRenderer.invoke('get-cache-files'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings) => ipcRenderer.invoke('set-settings', settings),
});
