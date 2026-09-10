const state = {
  currentView: 'liked',
  activeSource: 'youtube-music',
  songs: [],
  videos: [],
  queue: [],
  liked: [],
  currentSong: null,
  playing: false,
  volume: 0.8,
};

const els = {
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  browseBtn: document.getElementById('browseBtn'),
  songsList: document.getElementById('songsList'),
  videosList: document.getElementById('videosList'),
  likedList: document.getElementById('likedList'),
  queueList: document.getElementById('queueList'),
  searchList: document.getElementById('searchList'),
  songsCount: document.getElementById('songsCount'),
  videosCount: document.getElementById('videosCount'),
  queueCount: document.getElementById('queueCount'),
  searchStatus: document.getElementById('searchStatus'),
  detailArt: document.getElementById('detailArt'),
  detailTitle: document.getElementById('detailTitle'),
  detailArtist: document.getElementById('detailArtist'),
  lyricsContent: document.getElementById('lyricsContent'),
  nowThumb: document.getElementById('nowThumb'),
  nowTitle: document.getElementById('nowTitle'),
  nowArtist: document.getElementById('nowArtist'),
  timeCurrent: document.getElementById('timeCurrent'),
  timeTotal: document.getElementById('timeTotal'),
  seekBar: document.getElementById('seekBar'),
  volumeBar: document.getElementById('volumeBar'),
  player: document.getElementById('player'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  likeBtn: document.getElementById('likeBtn'),
  muteBtn: document.getElementById('muteBtn'),
  cacheInfo: document.getElementById('cacheInfo'),
  settingsVolume: document.getElementById('settingsVolume'),
  clearCacheBtn: document.getElementById('clearCacheBtn'),
  refreshLibraryBtn: document.getElementById('refreshLibraryBtn'),
};

function formatDuration(value) {
  const seconds = Number(value) || 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function getSearchSourceForView(viewName) {
  if (viewName === 'videos') return 'youtube';
  return 'youtube-music';
}

function syncSourceButtons() {
  document.querySelectorAll('.source-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.source === state.activeSource);
  });
}

function setView(name) {
  state.currentView = name;
  if (name === 'songs' || name === 'liked' || name === 'search') {
    state.activeSource = 'youtube-music';
  }
  if (name === 'videos') {
    state.activeSource = 'youtube';
  }
  syncSourceButtons();
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === name);
  });
  document.querySelectorAll('.content-view').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `${name}View`);
  });
}

function iconSvg(name) {
  const icons = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5-10-6.5Z" stroke="currentColor" stroke-width="1.8" fill="currentColor" stroke-linejoin="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.4" height="14" rx="1.5" fill="currentColor"/><rect x="13.6" y="5" width="3.4" height="14" rx="1.5" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 6v12M8.5 12l8.5-6v12L8.5 12Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 6v12M15.5 12L7 6v12l8.5-6Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7-4.35-9.22-8.03C1.3 9.78 3.16 5.5 7.2 5.5c2.12 0 3.53 1.04 4.8 2.38 1.27-1.34 2.68-2.38 4.8-2.38 4.04 0 5.9 4.28 4.42 6.97C19 16.15 12 20.5 12 20.5Z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10h3l5-4v12l-5-4H5v-4Zm10 2.5c1.2-1.2 1.2-3.2 0-4.4M17.5 7c2.4 2 2.4 8 0 10" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10h3l5-4v12l-5-4H5v-4Zm11.5 3 3-3m0 3-3-3" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 8.5c1.1.9 1.7 2.1 1.7 3.5s-.6 2.6-1.7 3.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="5.5" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    queue: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h11M5 12h11M5 17h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="17.5" cy="17" r="2.5" fill="currentColor"/></svg>'
  };
  return icons[name] || '';
}

function toUrl(value) {
  if (!value) return 'https://placehold.co/60x60/1f1f1f/fff?text=♫';
  if (value.startsWith('http')) return value;
  if (value.startsWith('file://')) return value;
  return `file://${value}`;
}

function renderSongRow(song, index, targetList) {
  const row = document.createElement('div');
  row.className = 'song-row';
  const isLiked = state.liked.includes(String(song.id || song.videoId || song.title));
  row.innerHTML = `
    <div class="song-index">${index + 1}</div>
    <img class="song-art" src="${song.thumbnail || 'https://placehold.co/60x60/1f1f1f/fff?text=♫'}" alt="${song.title}" />
    <div class="song-main">
      <div class="song-title">${song.title}</div>
      <div class="song-sub">${song.source === 'local' ? 'Local library' : song.source === 'youtube-music' ? 'YouTube Music' : song.source === 'youtube' ? 'YouTube' : 'Audio track'}</div>
    </div>
    <div class="song-artist">${song.artist || 'Unknown artist'}</div>
    <div class="song-duration">${typeof song.duration === 'string' ? song.duration : formatDuration(song.duration)}</div>
    <button class="song-action ${isLiked ? 'liked' : ''}" data-like="${String(song.id || song.videoId || song.title)}" aria-label="Like">${iconSvg('heart')}</button>
    <button class="song-action more" aria-label="More">${iconSvg('queue')}</button>
  `;

  row.addEventListener('click', (event) => {
    if (event.target.closest('[data-like]')) return;
    playSong(song);
  });

  const likeButton = row.querySelector('[data-like]');
  likeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleLike(song);
    renderAll();
  });

  row.querySelector('.more').addEventListener('click', (event) => {
    event.stopPropagation();
    queueSong(song);
  });

  targetList.appendChild(row);
}

function renderList(target, songs) {
  target.innerHTML = '';
  songs.forEach((song, index) => renderSongRow(song, index, target));
}

function renderSongs() {
  renderList(els.songsList, state.songs);
  els.songsCount.textContent = `${state.songs.length} songs`;
}

function renderVideos() {
  renderList(els.videosList, state.videos);
  els.videosCount.textContent = `${state.videos.length} videos`;
}

function renderLiked() {
  const liked = state.liked
    .map((id) => [...state.songs, ...state.videos].find((song) => song.id === id))
    .filter(Boolean);
  renderList(els.likedList, liked);
}

function renderQueue() {
  renderList(els.queueList, state.queue);
  els.queueCount.textContent = `${state.queue.length} tracks`;
}

function renderSearchResults(results) {
  renderList(els.searchList, results);
}

function renderAll() {
  renderSongs();
  renderVideos();
  renderLiked();
  renderQueue();
}

function updateDetail(song) {
  if (!song) {
    els.detailArt.src = 'https://placehold.co/360x360/1f1f1f/fff?text=Album';
    els.detailTitle.textContent = 'Nothing playing';
    els.detailArtist.textContent = 'No artist';
    els.lyricsContent.textContent = 'No lyrics available';
    return;
  }

  els.detailArt.src = song.thumbnail || 'https://placehold.co/360x360/1f1f1f/fff?text=Album';
  els.detailTitle.textContent = song.title || 'Unknown title';
  els.detailArtist.textContent = song.artist || 'Unknown artist';
  const lyricText = (song.lyrics && song.lyrics.trim()) || `\n${song.title}\n\n${song.artist}\n\n${song.title} is playing right now.`;
  els.lyricsContent.textContent = lyricText;
}

function updateNowPlaying(song) {
  if (!song) {
    els.nowThumb.src = 'https://placehold.co/56x56/1f1f1f/fff?text=♫';
    els.nowTitle.textContent = 'Nothing playing';
    els.nowArtist.textContent = 'Select a song';
    els.likeBtn.innerHTML = iconSvg('heart');
    return;
  }
  const key = String(song.id || song.videoId || song.title);
  els.nowThumb.src = song.thumbnail || 'https://placehold.co/56x56/1f1f1f/fff?text=♫';
  els.nowTitle.textContent = song.title || 'Untitled';
  els.nowArtist.textContent = song.artist || 'Unknown artist';
  els.likeBtn.innerHTML = iconSvg('heart');
  els.likeBtn.classList.toggle('active', state.liked.includes(key));
}

function queueSong(song) {
  if (!song) return;
  const key = String(song.id || song.videoId || song.title);
  const exists = state.queue.find((entry) => entry.id === key);
  if (!exists) {
    state.queue.push({ ...song, id: key });
  }
  renderQueue();
}

function findCurrentIndex() {
  if (!state.currentSong) return -1;
  const key = String(state.currentSong.id || state.currentSong.videoId || state.currentSong.title);
  return state.queue.findIndex((s) => String(s.id) === key);
}

function playIndex(idx) {
  if (idx < 0 || idx >= state.queue.length) return;
  playSong(state.queue[idx]);
}

function nextTrack() {
  const idx = findCurrentIndex();
  if (idx === -1) {
    if (state.queue.length > 0) playIndex(0);
    return;
  }
  const next = idx + 1;
  if (next < state.queue.length) {
    playIndex(next);
  } else {
    // reached end - stop playback
    els.player.pause();
    state.playing = false;
    els.playPauseBtn.innerHTML = iconSvg('play');
  }
}

function prevTrack() {
  const idx = findCurrentIndex();
  if (idx <= 0) return;
  playIndex(idx - 1);
}

function toggleLike(song) {
  if (!song) return;
  const key = String(song.id || song.videoId || song.title);
  if (state.liked.includes(key)) {
    state.liked = state.liked.filter((item) => item !== key);
  } else {
    state.liked.push(key);
  }
}

function playSong(song) {
  if (!song) return;
  state.currentSong = song;
  updateNowPlaying(song);
  updateDetail(song);

  if (song.source === 'youtube' || song.source === 'youtube-music') {
    window.electronAPI.downloadAudio(song)
      .then((filePath) => {
        if (!filePath) {
          els.nowTitle.textContent = 'Download failed';
          return;
        }
        els.player.src = filePath;
        els.player.volume = state.volume;
        els.player.play();
        state.playing = true;
        els.playPauseBtn.textContent = '❚❚';
      })
      .catch(() => {
        els.nowTitle.textContent = 'Download failed';
      });
  } else {
    els.player.src = toUrl(song.path);
    els.player.volume = state.volume;
    els.player.play();
    state.playing = true;
    els.playPauseBtn.textContent = '❚❚';
  }

  queueSong(song);
}

async function performSearch(query) {
  const q = (query || '').trim();
  if (!q) return;
  const source = state.activeSource;
  els.searchStatus.textContent = 'Searching...';

  try {
    const results = await window.electronAPI.searchYouTube(q, source);
    const mapped = (results || []).map((item) => ({
      id: item.videoId || item.id,
      title: item.title,
      artist: item.author || item.artist || 'Unknown artist',
      duration: item.duration || '0:00',
      thumbnail: item.thumbnail || 'https://placehold.co/60x60/1f1f1f/fff?text=♫',
      source: source,
      videoId: item.videoId || item.id,
      lyrics: item.title,
    }));

    if (source === 'youtube') {
      state.videos = mapped;
      renderVideos();
    } else {
      state.songs = mapped;
      renderSongs();
    }

    els.searchStatus.textContent = `${mapped.length} results`;
  } catch (error) {
    console.error(error);
    els.searchStatus.textContent = 'Search failed';
  }
}

async function loadLocalFolder() {
  try {
    const songs = await window.electronAPI.getLocalSongs();
    const mapped = (songs || []).map((song, index) => ({
      id: String(song.id || song.path || index),
      title: song.title || 'Unknown title',
      artist: song.artist || 'Local file',
      duration: song.duration || 0,
      thumbnail: song.thumbnail || 'https://placehold.co/60x60/1f1f1f/fff?text=♫',
      source: 'local',
      path: song.path,
      lyrics: song.title,
    }));
    state.songs = mapped;
    renderSongs();
  } catch (error) {
    console.error(error);
  }
}

async function refreshCacheInfo() {
  try {
    const files = await window.electronAPI.getCacheFiles();
    const total = files.reduce((sum, file) => sum + Number(file.size || 0), 0);
    els.cacheInfo.textContent = `${files.length} files • ${Math.round(total / 1024)} KB`;
  } catch (error) {
    els.cacheInfo.textContent = 'Ready';
  }
}

async function clearCache() {
  try {
    const result = await window.electronAPI.clearCache();
    els.cacheInfo.textContent = `${result.removed || 0} files removed`;
  } catch (error) {
    els.cacheInfo.textContent = 'Clear cache failed';
  }
}

function bindControls() {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => setView(item.dataset.view));
  });

  document.querySelectorAll('.source-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSource = button.dataset.source;
      document.querySelectorAll('.source-btn').forEach((btn) => btn.classList.toggle('active', btn === button));
    });
  });

  els.searchBtn.addEventListener('click', () => {
    performSearch(els.searchInput.value);
    setView('search');
  });

  els.searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      performSearch(els.searchInput.value);
      setView('search');
    }
  });

  els.browseBtn.addEventListener('click', async () => {
    const songs = await window.electronAPI.browseMusicFolder();
    state.songs = (songs || []).map((song, index) => ({
      id: String(song.id || song.path || index),
      title: song.title || 'Unknown title',
      artist: song.artist || 'Local file',
      duration: song.duration || 0,
      thumbnail: song.thumbnail || 'https://placehold.co/60x60/1f1f1f/fff?text=♫',
      source: 'local',
      path: song.path,
      lyrics: song.title,
    }));
    renderSongs();
  });

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((btn) => btn.classList.toggle('active', btn === tab));
      const key = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach((pane) => pane.classList.toggle('active', pane.id === `${key}Pane`));
    });
  });

  els.playPauseBtn.addEventListener('click', () => {
    if (!els.player.src) return;
    if (els.player.paused) {
      els.player.play();
      state.playing = true;
      els.playPauseBtn.innerHTML = iconSvg('pause');
    } else {
      els.player.pause();
      state.playing = false;
      els.playPauseBtn.innerHTML = iconSvg('play');
    }
  });

  // previous / next handlers
  els.prevBtn.addEventListener('click', () => {
    prevTrack();
  });
  els.nextBtn.addEventListener('click', () => {
    nextTrack();
  });

  els.seekBar.addEventListener('input', () => {
    if (!els.player.duration) return;
    els.player.currentTime = (Number(els.seekBar.value) / 100) * els.player.duration;
  });

  els.player.addEventListener('timeupdate', () => {
    if (!Number.isFinite(els.player.duration) || els.player.duration <= 0) return;
    const ratio = (els.player.currentTime / els.player.duration) * 100;
    els.seekBar.value = ratio;
    els.timeCurrent.textContent = formatDuration(els.player.currentTime);
    els.timeTotal.textContent = formatDuration(els.player.duration);
  });

  els.player.addEventListener('loadedmetadata', () => {
    els.timeTotal.textContent = formatDuration(els.player.duration || 0);
  });

  els.player.addEventListener('ended', () => {
    // auto play next track in queue
    nextTrack();
  });

  els.volumeBar.addEventListener('input', () => {
    state.volume = Number(els.volumeBar.value);
    els.player.volume = state.volume;
  });

  els.settingsVolume.addEventListener('input', () => {
    state.volume = Number(els.settingsVolume.value);
    els.volumeBar.value = state.volume;
    els.player.volume = state.volume;
    window.electronAPI.setSettings({ volume: state.volume });
  });

  els.clearCacheBtn.addEventListener('click', clearCache);
  els.refreshLibraryBtn.addEventListener('click', loadLocalFolder);

  els.likeBtn.addEventListener('click', () => {
    if (!state.currentSong) return;
    toggleLike(state.currentSong);
    updateNowPlaying(state.currentSong);
    renderAll();
  });

  els.muteBtn = document.getElementById('muteBtn');
  // toggle mute and update icon
  els.muteBtn.addEventListener('click', () => {
    const wasMuted = els.player.volume === 0;
    const nextVolume = wasMuted ? (state.volume || 0.8) : 0;
    els.player.volume = nextVolume;
    els.volumeBar.value = nextVolume;
    els.settingsVolume.value = nextVolume;
    els.muteBtn.innerHTML = nextVolume === 0 ? iconSvg('mute') : iconSvg('volume');
  });
  els.likeBtn.innerHTML = iconSvg('heart');

  // initialize transport icons
  if (els.prevBtn) els.prevBtn.innerHTML = iconSvg('prev');
  if (els.nextBtn) els.nextBtn.innerHTML = iconSvg('next');
  if (els.playPauseBtn) els.playPauseBtn.innerHTML = iconSvg('play');
  if (els.muteBtn) els.muteBtn.innerHTML = iconSvg('volume');
}


async function bootstrap() {
  bindControls();
  setView('liked');
  const settings = await window.electronAPI.getSettings();
  if (settings && settings.volume) {
    state.volume = Number(settings.volume) || 0.8;
    els.volumeBar.value = state.volume;
    els.settingsVolume.value = state.volume;
    els.player.volume = state.volume;
  }
  await loadLocalFolder();
  refreshCacheInfo();
  renderAll();
}

bootstrap();
