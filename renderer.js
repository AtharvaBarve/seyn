const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const songListContainer = document.getElementById('songList');
const youtubeResultsContainer = document.getElementById('youtubeResults');
const audioPlayer = document.getElementById('player');
const nowTitle = document.getElementById('nowTitle');
const nowThumb = document.getElementById('nowThumb');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentPlaylist = [];
let currentSongIndex = -1;

// 🎧 Load Local Songs
async function loadLocalSongs() {
  const songs = await window.electronAPI.getLocalSongs();
  songListContainer.innerHTML = '';
  currentPlaylist = [];

  songs.forEach(song => {
    const songData = {
      title: song.title,
      path: song.path,
      thumbnail: song.thumbnail || 'https://via.placeholder.com/80x60?text=♫',
      source: 'local',
    };

    currentPlaylist.push(songData);

    renderSongCard({
      ...songData,
      container: songListContainer,
    });
  });
}

// 🔍 Search Input with Enter
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// 📡 Search YouTube
searchBtn.onclick = async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  youtubeResultsContainer.innerHTML = `<div>Searching YouTube for "${query}"...</div>`;

  try {
    const results = await window.electronAPI.searchYouTube(query);
    youtubeResultsContainer.innerHTML = '';
    currentPlaylist = [];

    results.forEach(video => {
      const songData = {
        title: video.title,
        videoId: video.videoId,
        thumbnail: video.thumbnail || 'https://via.placeholder.com/80x60?text=YT',
        source: 'youtube',
      };

      currentPlaylist.push(songData);

      renderSongCard({
        ...songData,
        container: youtubeResultsContainer,
      });
    });
  } catch (error) {
    console.error('Search error:', error);
    youtubeResultsContainer.innerHTML = `<div style="color:red;">Search failed ❌</div>`;
  }
};

// 🧱 Render a Song Card
function renderSongCard({ title, path, videoId, thumbnail, source, container }) {
  const div = document.createElement('div');
  div.classList.add('song-item');

  const img = document.createElement('img');
  img.className = 'thumb';
  img.src = thumbnail;

  const info = document.createElement('div');
  info.className = 'song-info';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'song-title';
  titleDiv.textContent = `${source === 'local' ? '🎧' : '📡'} ${title}`;
  titleDiv.title = title;
  info.appendChild(titleDiv);

  const playBtn = document.createElement('button');
  playBtn.className = 'download-btn';
  playBtn.textContent = 'Play';

  const thisIndex = currentPlaylist.length - 1;

  playBtn.onclick = async () => {
    currentSongIndex = thisIndex;

    if (source === 'local') {
      playSong(path, title, thumbnail);
    } else {
      nowTitle.textContent = `Downloading "${title}"...`;
      nowThumb.src = 'https://via.placeholder.com/40x40?text=...';

      const filePath = await window.electronAPI.downloadAudio({ title, videoId, thumbnail });
      if (filePath) {
        playSong(filePath, title, thumbnail);
        loadLocalSongs(); // refresh local songs after download
        youtubeResultsContainer.innerHTML = '';
      } else {
        nowTitle.textContent = 'Download failed ❌';
        nowThumb.src = '';
      }
    }
  };

  div.appendChild(img);
  div.appendChild(info);
  div.appendChild(playBtn);
  container.appendChild(div);
}

// 🔊 Play Song
function playSong(path, title, thumbnail = '') {
  audioPlayer.src = path;
  audioPlayer.play();
  nowTitle.textContent = title.replace(/\.mp3$/, '');
  nowThumb.src = thumbnail || 'https://via.placeholder.com/40x40?text=♫';
}

// ⏭️ Play Next Song
function playNextSong() {
  if (currentPlaylist.length === 0) return;
  currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;

  const next = currentPlaylist[currentSongIndex];

  if (next.source === 'local') {
    playSong(next.path, next.title, next.thumbnail);
  } else {
    searchBtn.click(); // fallback: re-download if YouTube
  }
}

// ⏮️ Play Previous Song
function playPrevSong() {
  if (currentPlaylist.length === 0) return;
  currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;

  const prev = currentPlaylist[currentSongIndex];

  if (prev.source === 'local') {
    playSong(prev.path, prev.title, prev.thumbnail);
  } else {
    searchBtn.click();
  }
}

// 🎧 Auto-play next on end
audioPlayer.addEventListener('ended', playNextSong);

// ⏮️⏭️ Button Events
nextBtn.addEventListener('click', playNextSong);
prevBtn.addEventListener('click', playPrevSong);

// 🚀 Initial Load
loadLocalSongs();
