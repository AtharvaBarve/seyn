const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

async function searchYouTube(query) {
  const result = await ytSearch(query);
  return result.videos.slice(0, 10).map(video => ({
    title: video.title,
    videoId: video.videoId,
    url: video.url,
    duration: video.timestamp,
    thumbnail: video.thumbnail,
    author: video.author.name
  }));
}

async function getAudio(video) {
  const filepath = path.join(CACHE_DIR, `${video.videoId}.mp3`);
  if (fs.existsSync(filepath)) {
    console.log(`[CACHE] Using cached audio for ${video.title}`);
    return filepath;
  }

  return new Promise((resolve, reject) => {
    console.log(`[INFO] Downloading audio for: ${video.title}`);

    const stream = ytdl(video.url, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25 // 32MB buffer
    });

    const ffmpeg = spawn('ffmpeg', [
      '-y', // overwrite if exists
      '-i', 'pipe:0',
      '-f', 'mp3',
      '-ab', '192000',
      '-vn',
      filepath
    ]);

    // Logging ffmpeg stderr
    ffmpeg.stderr.on('data', data => {
      console.log('[FFmpeg]', data.toString());
    });

    // Error handling
    stream.on('error', err => {
      console.error('[YTDL Error]', err.message);
      reject(err);
    });

    ffmpeg.stdin.on('error', err => {
      console.error('[FFmpeg Stdin Error]', err.message);
      reject(err);
    });

    ffmpeg.on('close', code => {
      if (code === 0) {
        console.log(`[SUCCESS] Audio saved: ${filepath}`);
        resolve(filepath);
      } else {
        console.error(`[ERROR] FFmpeg exited with code ${code}`);
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    stream.pipe(ffmpeg.stdin);
  });
}

module.exports = { searchYouTube, getAudio };
