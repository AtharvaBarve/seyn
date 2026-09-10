const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const { CACHE_DIR_NAME } = require('../../shared/constants');

const CACHE_DIR = path.join(__dirname, '..', '..', '..', CACHE_DIR_NAME);

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  return CACHE_DIR;
}

function formatQuery(query, source = 'youtube-music') {
  const trimmed = String(query || '').trim();
  if (!trimmed) return '';
  return source === 'youtube' ? trimmed : `${trimmed} song`;
}

async function searchYoutube(query, source = 'youtube-music') {
  const term = formatQuery(query, source);
  if (!term) return [];

  try {
    const result = await ytSearch(term);
    return (result?.videos || []).slice(0, 12).map((video) => ({
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
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', () => resolve());
  });
}

async function downloadAudio(video) {
  if (!video || !video.videoId) return null;
  const filePath = audioPathById(video.videoId);
  if (fs.existsSync(filePath)) return filePath;

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
  downloadAudio,
  CACHE_DIR,
  thumbPathById,
  audioPathById,
};
