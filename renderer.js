const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const localSongsContainer = document.getElementById('localSongs');
const youtubeResultsContainer = document.getElementById('youtubeResults');
const audioPlayer = document.getElementById('player');
const nowTitle = document.getElementById('nowTitle');
const nowThumb = document.getElementById('nowThumb');

// Load Local Songs
async function loadLocalSongs() {
  const songs = await window.electronAPI.getLocalSongs();
  localSongsContainer.innerHTML = '';
  songs.forEach(song => {
    const div = document.createElement('div');
    div.classList.add('song-item');

    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = song.thumbnail || 'https://via.placeholder.com/80x60?text=♫';

    const title = document.createElement('div');
    title.className = 'song-title';
    title.textContent = song.title;

    const playBtn = document.createElement('button');
    playBtn.className = 'download-btn';
    playBtn.textContent = 'Play';
    playBtn.onclick = () => playSong(song.path, song.title, song.thumbnail);

    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(playBtn);

    localSongsContainer.appendChild(div);
  });
}

// Search YouTube
searchBtn.onclick = async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  const results = await window.electronAPI.searchYouTube(query);
  youtubeResultsContainer.innerHTML = '';
  results.forEach(video => {
    const div = document.createElement('div');
    div.classList.add('song-item');

    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = video.thumbnail || 'https://via.placeholder.com/80x60?text=YT';

    const title = document.createElement('div');
    title.className = 'song-title';
    title.textContent = video.title;

    const playBtn = document.createElement('button');
    playBtn.className = 'download-btn';
    playBtn.textContent = 'Play';
    playBtn.onclick = async () => {
      nowTitle.textContent = `Downloading "${video.title}"...`;
      nowThumb.src = 'https://via.placeholder.com/40x40?text=...';

      const path = await window.electronAPI.downloadAudio(video);
      if (path) {
        playSong(path, video.title, video.thumbnail);
        loadLocalSongs(); // refresh list
      } else {
        nowTitle.textContent = 'Download failed ❌';
        nowThumb.src = '';
      }
    };

    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(playBtn);

    youtubeResultsContainer.appendChild(div);
  });
};

// Play Song
function playSong(path, title, thumbnail = '') {
  audioPlayer.src = path;
  audioPlayer.play();
  nowTitle.textContent = title.replace(/\.mp3$/, '');
  nowThumb.src = thumbnail || 'https://via.placeholder.com/40x40?text=♫';
}

// On Load
loadLocalSongs();
