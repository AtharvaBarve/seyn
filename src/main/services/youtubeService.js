const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const { CACHE_DIR_NAME } = require('../../shared/constants');

const CACHE_DIR = path.join(app.getPath('userData'), CACHE_DIR_NAME);

const PYTHON_RUNTIME_DIR = path.join(
  app.isPackaged
    ? process.resourcesPath
    : path.join(__dirname, '..', '..', '..'),
  'python-runtime'
);

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  return CACHE_DIR;
}

function formatQuery(query, source = 'youtube-music') {
  const trimmed = String(query || '').trim();
  if (!trimmed) return '';
  return source === 'youtube' ? trimmed : `${trimmed} song`;
}

function spawnYtMusicSearch(term) {
  const scriptRoot = app.isPackaged
    ? path.join(process.resourcesPath, 'scripts')
    : path.join(__dirname, '..', '..', '..', 'scripts');

  const scriptPath = path.join(scriptRoot, 'ytmusic_search.py');

  return new Promise((resolve, reject) => {
    const child = spawn('python3', [scriptPath, term], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONPATH: PYTHON_RUNTIME_DIR,
      },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || 'ytmusic search failed'));
        return;
      }

      try {
        const parsed = JSON.parse(stdout.trim() || '[]');
        resolve(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        reject(new Error('Unable to parse YT Music search response'));
      }
    });

    child.on('error', (error) => reject(error));
  });
}

function spawnYtMusicLyrics(videoId) {
  const scriptRoot = app.isPackaged
    ? path.join(process.resourcesPath, 'scripts')
    : path.join(__dirname, '..', '..', '..', 'scripts');

  const scriptPath = path.join(scriptRoot, 'ytmusic_lyrics.py');

  return new Promise((resolve, reject) => {
    const child = spawn('python3', [scriptPath, videoId], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONPATH: PYTHON_RUNTIME_DIR,
      },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || 'ytmusic lyrics failed'));
        return;
      }

      try {
        const parsed = JSON.parse(stdout.trim() || '{}');

        resolve({
          lyrics: typeof parsed.lyrics === 'string' ? parsed.lyrics : '',
          lines: Array.isArray(parsed.lines) ? parsed.lines : [],
        });
      } catch (error) {
        reject(new Error('Unable to parse YT Music lyrics response'));
      }
    });

    child.on('error', (error) => reject(error));
  });
}

async function searchYoutube(query, source = 'youtube-music') {
  const term = formatQuery(query, source);
  if (!term) return [];

  if (source === 'youtube-music') {
    try {
      const results = await spawnYtMusicSearch(term);
      return results.map((item) => ({
        id: item.videoId || item.id,
        title: item.title,
        artist: item.artist || 'Unknown artist',
        duration: item.duration || '0:00',
        thumbnail: item.thumbnail || '',
        videoId: item.videoId || item.id,
        source: 'youtube-music',
        author: item.artist || 'Unknown artist',
        url: item.url || `https://music.youtube.com/watch?v=${item.videoId || item.id}`,
        lyrics: item.lyrics || '',
      }));
    } catch (error) {
      console.error('[searchYoutube][ytmusic]', error);
      return [];
    }
  }

  try {
    const result = await ytSearch(term);
    return (result?.videos || []).slice(0, 25).map((video) => ({
      id: video.videoId,
      title: video.title,
      artist: video.author?.name || 'Unknown artist',
      duration: video.timestamp || '0:00',
      thumbnail: video.thumbnail,
      videoId: video.videoId,
      source: source,
      author: video.author?.name || 'Unknown artist',
      url: video.url,
    }));
  } catch (error) {
    console.error('[searchYoutube]', error);
    return [];
  }
}

async function getLyricsFromVideo(videoId, source = 'youtube-music') {
  if (!videoId || source !== 'youtube-music') return { lyrics: '', lines: [] };
  try {
    return await spawnYtMusicLyrics(videoId);
  } catch (error) {
    console.error('[getLyricsFromVideo]', error);
    return { lyrics: '', lines: [] };
  }
}

function audioPathById(videoId) {
  ensureCacheDir();
  return path.join(CACHE_DIR, `${videoId}.mp3`);
}

function thumbPathById(videoId) {
  ensureCacheDir();
  return path.join(CACHE_DIR, `${videoId}.jpg`);
}

function downloadThumbnail(url, outputPath) {
  return new Promise((resolve) => {
    if (!url) return resolve();
    const https = require('https');
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        file.destroy();
        try { fs.unlinkSync(outputPath); } catch (error) { /* best effort */ }
        return resolve();
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', () => {
      file.destroy();
      try { fs.unlinkSync(outputPath); } catch (error) { /* best effort */ }
      resolve();
    });
  });
}

async function downloadAudio(video) {
  if (!video || !video.videoId) return null;
  const filePath = audioPathById(video.videoId);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) return filePath;

  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  try {
    await new Promise((resolve, reject) => {
      const stream = ytdl(videoUrl, { quality: 'highestaudio', filter: 'audioonly' });
      ffmpeg(stream)
        .audioBitrate(128)
        .format('mp3')
        .on('end', resolve)
        .on('error', reject)
        .save(filePath);
    });

    if (video.thumbnail) {
      await downloadThumbnail(video.thumbnail, thumbPathById(video.videoId));
    }
    return filePath;
  } catch (error) {
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (cleanupError) { /* best effort */ }
    try {
      const fallbackFile = filePath.replace(/\.mp3$/, '.tmp.mp3');
      const args = [
        '--no-playlist',
        '--no-warnings',
        '--extractor-args', 'youtube:player_client=android',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--output', fallbackFile,
        videoUrl,
      ];
      await new Promise((resolve, reject) => {
        const child = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] });
        let stderr = '';
        child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
        child.on('error', () => reject(new Error('yt-dlp not available')));
        child.on('close', (code) => {
          if (code === 0 && fs.existsSync(fallbackFile)) {
            fs.renameSync(fallbackFile, filePath);
            resolve();
          } else {
            try { if (fs.existsSync(fallbackFile)) fs.unlinkSync(fallbackFile); } catch (cleanupError) { /* best effort */ }
            reject(new Error(stderr.trim() || 'yt-dlp failed'));
          }
        });
      });
      if (video.thumbnail) await downloadThumbnail(video.thumbnail, thumbPathById(video.videoId));
      return filePath;
    } catch (fallbackError) {
      console.error('[downloadAudio fallback error]', fallbackError);
      return null;
    }
  }
}

module.exports = {
  ensureCacheDir,
  searchYoutube,
  getLyricsFromVideo,
  downloadAudio,
  CACHE_DIR,
  thumbPathById,
  audioPathById,
};
