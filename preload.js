'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Library
  selectMusicFolder: () => ipcRenderer.invoke('library:select-folder'),
  scanMusicFolder: (folderPath) => ipcRenderer.invoke('library:scan-folder', folderPath),
  getMusicFolder: () => ipcRenderer.invoke('library:get-folder'),
  getLocalSongs: () => ipcRenderer.invoke('library:get-local-songs'),

  // YouTube
  searchYouTube: (query) => ipcRenderer.invoke('youtube:search', query),
  downloadYouTubeAudio: (video) => ipcRenderer.invoke('youtube:download', video),

  // Cache
  getCacheInfo: () => ipcRenderer.invoke('cache:get-info'),
  clearCache: () => ipcRenderer.invoke('cache:clear'),
  cacheFileExists: (videoId) => ipcRenderer.invoke('cache:file-exists', videoId),

  // Player
  playSong: (song) => ipcRenderer.invoke('player:play', song),
  seekSong: (position) => ipcRenderer.invoke('player:seek', position),
  setVolume: (volume) => ipcRenderer.invoke('player:set-volume', volume),
  toggleMute: () => ipcRenderer.invoke('player:toggle-mute'),
});