const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const songListContainer = document.getElementById('songList');
const youtubeResultsContainer = document.getElementById('youtubeResults');
const audioPlayer = document.getElementById('player');
const nowTitle = document.getElementById('nowTitle');
const nowThumb = document.getElementById('nowThumb');

// 🎧 Load Local Songs
async function loadLocalSongs() {
  const songs = await window.electronAPI.getLocalSongs();
  songListContainer.innerHTML = '';
  songs.forEach(song => {
    renderSongCard({
      title: song.title,
      path: song.path,
      thumbnail: song.thumbnail || 'https://via.placeholder.com/80x60?text=♫',
      source: 'local',
      container: songListContainer,
    });
  });
}

// 📡 Search YouTube
searchBtn.onclick = async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  youtubeResultsContainer.innerHTML = `<div>Searching YouTube for "${query}"...</div>`;

  try {
    const results = await window.electronAPI.searchYouTube(query);
    youtubeResultsContainer.innerHTML = ''; // clear old ones

    results.forEach(video => {
      renderSongCard({
        title: video.title,
        videoId: video.videoId,
        thumbnail: video.thumbnail || 'https://via.placeholder.com/80x60?text=YT',
        source: 'youtube',
        container: youtubeResultsContainer,
      });
    });
  } catch (error) {
    console.error('Search error:', error);
    youtubeResultsContainer.innerHTML = `<div style="color:red;">Search failed ❌</div>`;
  }
};

// 🧱 Render a Song Card (Local or YouTube)
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

  playBtn.onclick = async () => {
    if (source === 'local') {
      playSong(path, title, thumbnail);
    } else {
      nowTitle.textContent = `Downloading "${title}"...`;
      nowThumb.src = 'https://via.placeholder.com/40x40?text=...';

      const filePath = await window.electronAPI.downloadAudio({ title, videoId, thumbnail });
      if (filePath) {
        playSong(filePath, title, thumbnail);
        loadLocalSongs(); // refresh local
        youtubeResultsContainer.innerHTML = ''; // clear YouTube list
      } else {
        nowTitle.textContent = 'Download failed ❌';
        nowThumb.src = '';
      }
    }
  };

  info.appendChild(titleDiv);
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

// On Load
loadLocalSongs();
