const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const localSongsContainer = document.getElementById('localSongs');
const youtubeResultsContainer = document.getElementById('youtubeResults');
const audioPlayer = document.getElementById('player');
const nowTitle = document.getElementById('nowTitle');
const nowThumb = document.getElementById('nowThumb');

// 🔁 Load Local Songs
async function loadLocalSongs() {
  const songs = await window.electronAPI.getLocalSongs();
  localSongsContainer.innerHTML = '';
  songs.forEach(song => {
    const btn = document.createElement('button');
    btn.textContent = song.title.replace(/\.mp3$/, '');
    btn.onclick = () => playSong(song.path, song.title);
    localSongsContainer.appendChild(btn);
  });
}

// 🔍 YouTube Search
searchBtn.onclick = async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  const results = await window.electronAPI.searchYouTube(query);
  youtubeResultsContainer.innerHTML = '';
  results.forEach(video => {
    const div = document.createElement('div');
    div.classList.add('yt-result');

    const title = document.createElement('div');
    title.textContent = video.title;
    title.className = 'yt-title';

    const playBtn = document.createElement('button');
    playBtn.textContent = 'Play';
    playBtn.onclick = async () => {
      const path = await window.electronAPI.downloadAndPlay(video);
      if (path) {
        playSong(path, video.title, `https://img.youtube.com/vi/${video.videoId}/default.jpg`);
        loadLocalSongs(); // Refresh local list
      }
    };

    div.appendChild(title);
    div.appendChild(playBtn);
    youtubeResultsContainer.appendChild(div);
  });
};

// 🎵 Play Song (Update Player + UI)
function playSong(path, title, thumbnail = '') {
  audioPlayer.src = path;
  audioPlayer.play();
  if (nowTitle) nowTitle.textContent = title.replace(/\.mp3$/, '');
  if (nowThumb) nowThumb.src = thumbnail || '';
}

// 📦 On load
loadLocalSongs();
