const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Get local songs from cache folder
ipcMain.handle('get-local-songs', () => {
  const cachePath = path.join(__dirname, 'cache');
  if (!fs.existsSync(cachePath)) return [];
  return fs.readdirSync(cachePath)
    .filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
    .map(file => ({
      title: file,
      path: path.join(cachePath, file),
    }));
});

// Allow browsing a music folder
ipcMain.handle('browse-music-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled) return [];

  const dirPath = result.filePaths[0];
  const files = fs.readdirSync(dirPath);
  return files
    .filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
    .map(file => ({
      title: file,
      path: path.join(dirPath, file),
    }));
});

// YouTube search
ipcMain.handle('search-youtube', async (_, query) => {
  const ytSearch = require('yt-search');
  const result = await ytSearch(query);
  return result.videos.slice(0, 10).map(video => ({
    title: video.title,
    duration: video.timestamp,
    description: video.description,
    videoId: video.videoId,
  }));
});

// Download audio from YouTube
ipcMain.handle('download-audio', async (_, video) => {
  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  const cachePath = path.join(__dirname, 'cache');
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

  const safeTitle = video.title.replace(/[^a-z0-9 \-_]/gi, '').slice(0, 50); // Clean + safe
  const filename = `${safeTitle}-${video.videoId}.mp3`;
  const filepath = path.join(cachePath, filename);

  if (fs.existsSync(filepath)) {
    return filepath;
  }

  return new Promise((resolve, reject) => {
    const stream = ytdl(videoUrl, { quality: 'highestaudio' });

    ffmpeg(stream)
      .audioBitrate(128)
      .format('mp3')
      .on('end', () => resolve(filepath))
      .on('error', (err) => {
        console.error('[FFmpeg Error]', err);
        reject(null);
      })
      .save(filepath);
  }).catch(() => null);
});
