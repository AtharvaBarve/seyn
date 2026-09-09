'use strict';

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const {
  createLocalSong,
  createYouTubeSong,
  normalizeSong,
} = require('./src/shared/types');

const {
  SUPPORTED_AUDIO_EXTENSIONS,
  DEFAULT_VOLUME,
} = require('./src/shared/constants');

const { scanMusicFolder } = require('./src/main/services/libraryScanner');
const { searchYouTube, downloadAudio, cacheManager } = require('./src/main/services/youtubeService');
const { loadSettings, saveSettings } = require('./src/main/settings');

let mainWindow;
let settings;

// Initialize services after Electron is ready
async function initializeServices() {
  settings = loadSettings();
  return {
    cacheManager,
    searchYouTube,
    downloadAudio,
  };
}

// Create the browser window.
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

// Listen when window is closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(async () => {
  // Initialize services
  await initializeServices();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// IPC Handlers

// --- Library ---

ipcMain.handle('library:select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Music Folder',
  });
  if (result.canceled || !result.filePaths[0]) return null;

  const folderPath = result.filePaths[0];
  const songs = await scanMusicFolder(folderPath);
  return saveSettings({ musicFolder: folderPath, localLibrary: songs.map(s => s.id) })
    .then(() => songs);
});

ipcMain.handle('library:scan-folder', async (_, folderPath) => {
  if (!folderPath || typeof folderPath !== 'string') return [];
  return scanMusicFolder(folderPath);
});

ipcMain.handle('library:get-folder', () => settings.musicFolder || null);

ipcMain.handle('library:get-local-songs', async () => {
  // Return cached local songs from previous scan
  return cacheManager.getInfo();
});

// --- YouTube ---

ipcMain.handle('youtube:search', async (_, query) => {
  if (!query || typeof query !== 'string' || query.trim() === '') return [];
  return searchYouTube(query.trim()).then(songs => songs.map(song => normalizeSong(song)));
});

ipcMain.handle('youtube:download', async (_, video) => {
  if (!video || typeof video !== 'object') return null;
  try {
    return await downloadAudio(video);
  } catch (error) {
    console.error('[YouTube Download IPC Error]', error);
    return null;
  }
});

// --- Cache ---

ipcMain.handle('cache:get-info', () => {
  return cacheManager.getInfo();
});

ipcMain.handle('cache:clear', async () => {
  return cacheManager.clear();
});

ipcMain.handle('cache:file-exists', async (_, videoId) => {
  if (!videoId || typeof videoId !== 'string') return false;
  return cacheManager.fileExists(videoId);
});

// --- New IPC handlers for queue and playback ---

ipcMain.handle('player:play', async (_, songNormalized) => {
  if (!songNormalized) return { success: false, error: 'No song provided' };
  try {
    const normalized = normalizeSong(songNormalized);
    return { success: true, normalizedSong: normalized };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('player:seek', async (_, position) => {
  return { success: true, position };
});

ipcMain.handle('player:set-volume', async (_, volume) => {
  return { success: true, volume };
});

ipcMain.handle('player:toggle-mute', async () => {
  return { success: true, isMuted: false };
});

// --- Cleanup on app close ---
app.on('will-quit', () => {
  // Any cleanup logic here
});