const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { searchYoutube, getLyricsFromVideo, downloadAudio, CACHE_DIR, audioPathById, thumbPathById } = require('./src/main/services/youtubeService');
const { scanMusicFolder } = require('./src/main/services/libraryService');

const SETTINGS_PATH = path.join(app.getPath('userData'), 'vitune-settings.json');

function readSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return { musicFolder: '', volume: 0.8, liked: [], likedSongs: [], history: [], playlists: [], playCounts: {}, autoReplay: false, syncLyrics: true, theme: 'dark' };
  }
}

function writeSettings(next) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2));
  return next;
}

let mainWindow;

if (process.platform === 'linux' && process.getuid && process.getuid() === 0) {
  app.commandLine.appendSwitch('no-sandbox');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#000000',
    icon: path.join(__dirname, 'assets', 'seyn-logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-settings', () => readSettings());
ipcMain.handle('set-settings', (_, incoming) => {
  const current = readSettings();
  return writeSettings({
    ...current,
    ...incoming,
    liked: Array.isArray(incoming?.liked) ? incoming.liked : current.liked || [],
    history: Array.isArray(incoming?.history) ? incoming.history : current.history || [],
  });
});

ipcMain.handle('browse-music-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select music folder',
  });
  if (canceled || !filePaths[0]) return [];
  const folder = filePaths[0];
  const songs = scanMusicFolder(folder);
  const settings = readSettings();
  writeSettings({ ...settings, musicFolder: folder });
  return songs;
});

ipcMain.handle('get-local-songs', () => {
  const settings = readSettings();
  const folder = settings.musicFolder;
  if (!folder || !fs.existsSync(folder)) return [];
  return scanMusicFolder(folder);
});

ipcMain.handle('search-youtube', async (_, query, source = 'youtube-music') => {
  return searchYoutube(query, source);
});

ipcMain.handle('get-lyrics', async (_, videoId, source = 'youtube-music') => {
  return getLyricsFromVideo(videoId, source);
});

ipcMain.handle('download-audio', async (_, video) => {
  return downloadAudio(video);
});

ipcMain.handle('clear-cache', async () => {
  if (!fs.existsSync(CACHE_DIR)) return { removed: 0 };
  let removed = 0;
  for (const file of fs.readdirSync(CACHE_DIR)) {
    const target = path.join(CACHE_DIR, file);
    if (fs.statSync(target).isFile()) {
      fs.unlinkSync(target);
      removed += 1;
    }
  }
  return { removed };
});

ipcMain.handle('delete-cache-file', async (_, videoId) => {
  if (!videoId || !/^[\w-]+$/.test(String(videoId))) return { removed: 0 };
  let removed = 0;
  for (const target of [audioPathById(String(videoId)), thumbPathById(String(videoId))]) {
    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
      fs.unlinkSync(target);
      removed += 1;
    }
  }
  return { removed };
});

ipcMain.handle('get-cache-files', async () => {
  if (!fs.existsSync(CACHE_DIR)) return [];
  return fs.readdirSync(CACHE_DIR).map((name) => ({
    name,
    path: path.join(CACHE_DIR, name),
    size: fs.statSync(path.join(CACHE_DIR, name)).size,
  }));
});
