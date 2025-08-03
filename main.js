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

ipcMain.handle('get-local-songs', () => {
  const cachePath = path.join(__dirname, 'cache');
  if (!fs.existsSync(cachePath)) return [];
  return fs.readdirSync(cachePath)
    .filter(file => file.endsWith('.mp3'))
    .map(file => {
      const thumbPath = path.join(cachePath, file.replace(/\.mp3$/, '.jpg'));
      return {
        title: file.replace(/\.mp3$/, ''),
        path: path.join(cachePath, file),
        thumbnail: fs.existsSync(thumbPath) ? `file://${thumbPath}` : '',
      };
    });
});

ipcMain.handle('search-youtube', async (_, query) => {
  const ytSearch = require('yt-search');
  const result = await ytSearch(query);
  return result.videos.slice(0, 10).map(video => ({
    title: video.title,
    duration: video.timestamp,
    videoId: video.videoId,
    thumbnail: video.thumbnail,
  }));
});

ipcMain.handle('download-audio', async (_, video) => {
  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  const cachePath = path.join(__dirname, 'cache');
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

  const safeTitle = video.title.replace(/[^a-zA-Z0-9 \-_]/g, '').slice(0, 50).trim();
  const filename = `${safeTitle}.mp3`;
  const filepath = path.join(cachePath, filename);

  if (fs.existsSync(filepath)) return filepath;

  return new Promise((resolve, reject) => {
    const stream = ytdl(videoUrl, { quality: 'highestaudio' });

    ffmpeg(stream)
      .audioBitrate(128)
      .format('mp3')
      .on('end', async () => {
        // Download thumbnail too
        if (video.thumbnail) {
          const thumbPath = path.join(cachePath, filename.replace(/\.mp3$/, '.jpg'));
          const https = require('https');
          const file = fs.createWriteStream(thumbPath);
          https.get(video.thumbnail, res => res.pipe(file));
        }
        resolve(filepath);
      })
      .on('error', (err) => {
        console.error('[FFmpeg Error]', err);
        reject(null);
      })
      .save(filepath);
  }).catch(err => {
    console.error('[Download Failure]', err);
    return null;
  });
});

