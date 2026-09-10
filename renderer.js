const state = {
  currentView: 'home',
  activeSource: 'youtube-music',
  songs: [],
  videos: [],
  liked: [],
  history: [],
  similarSongs: [],
  currentSong: null,
  playing: false,
  volume: 0.8,
  lyricsRequestToken: null,
};

const els = {
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  songsList: document.getElementById('songsList'),
  videosList: document.getElementById('videosList'),
  likedList: document.getElementById('likedList'),
  homeRecommendations: document.getElementById('homeRecommendations'),
  historyList: document.getElementById('historyList'),
  searchList: document.getElementById('searchList'),
  songsCount: document.getElementById('songsCount'),
  videosCount: document.getElementById('videosCount'),
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

function getCurrentSection() {
  return document.querySelector('.nav-item.active')?.dataset.view || state.currentView || 'songs';
}

function setView(name) {
  state.currentView = name;
  if (name === 'songs' || name === 'liked') {
    state.activeSource = 'youtube-music';
  }
  if (name === 'videos') {
    state.activeSource = 'youtube';
  }
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
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="5.5" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };
  return icons[name] || '';
}

function toUrl(value) {
  if (!value) return 'https://placehold.co/60x60/1f1f1f/fff?text=♫';
  if (value.startsWith('http')) return value;
  if (value.startsWith('file://')) return value;
  return `file://${value}`;
}

function songKey(song) {
  return String(song?.id || song?.videoId || `${song?.title || ''}::${song?.artist || ''}`);
}

function dedupeSongs(songs, excludedKeys = new Set()) {
  const seen = new Set(excludedKeys);
  const unique = [];
  for (const song of songs || []) {
    const key = songKey(song);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(song);
  }
  return unique;
}

function renderSongRow(song, index, targetList) {
  const row = document.createElement('div');
  row.className = 'song-row';
  const isLiked = state.liked.includes(songKey(song));
  row.innerHTML = `
    <div class="song-index">${index + 1}</div>
    <img class="song-art" src="${song.thumbnail || 'https://placehold.co/60x60/1f1f1f/fff?text=♫'}" alt="${song.title}" />
    <div class="song-main">
      <div class="song-title">${song.title}</div>
    </div>
    <div class="song-artist">${song.artist || 'Unknown artist'}</div>
    <div class="song-duration">${typeof song.duration === 'string' ? song.duration : formatDuration(song.duration)}</div>
    <button class="song-action ${isLiked ? 'liked' : ''}" data-like="${String(song.id || song.videoId || song.title)}" aria-label="Like">${iconSvg('heart')}</button>
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
    .map((id) => [...state.songs, ...state.videos, ...state.similarSongs].find((song) => songKey(song) === id))
    .filter(Boolean);
  renderList(els.likedList, dedupeSongs(liked));
}

function renderSearchResults(results) {
  renderList(els.searchList, results);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRecommendedSongs() {
  if (state.similarSongs.length > 0) {
    return dedupeSongs(state.similarSongs, state.currentSong ? new Set([songKey(state.currentSong)]) : undefined).slice(0, 8);
  }

  const pool = dedupeSongs([...state.songs, ...state.videos, ...state.history]);
  if (state.history.length > 0) {
    const artists = new Set(state.history.map((song) => String(song.artist || '').toLowerCase()));
    const artistMatches = dedupeSongs(pool.filter((song) => artists.has(String(song.artist || '').toLowerCase())));
    if (artistMatches.length > 0) {
      return artistMatches.slice(0, 8);
    }
  }

  if (pool.length > 0) {
    return shuffle(pool).slice(0, 8);
  }

  return [];
}

function renderHomeRecommendations() {
  const recommendations = getRecommendedSongs();
  renderList(els.homeRecommendations, recommendations);
}

function renderHistory() {
  renderList(els.historyList, state.history);
}

function renderAll() {
  renderSongs();
  renderVideos();
  renderLiked();
  renderHistory();
  renderHomeRecommendations();
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function updateDetail(song) {
  if (!song) {
    els.detailArt.src = 'https://placehold.co/360x360/1f1f1f/fff?text=Album';
    els.detailTitle.textContent = 'Nothing playing';
    els.detailArtist.textContent = 'No artist';
    els.lyricsContent.innerHTML = 'No lyrics available';
    return;
  }

  els.detailArt.src = song.thumbnail || 'https://placehold.co/360x360/1f1f1f/fff?text=Album';
  els.detailTitle.textContent = song.title || 'Unknown title';
  els.detailArtist.textContent = song.artist || 'Unknown artist';

  const fallbackLyrics = song.source === 'youtube-music' ? 'Loading lyrics...' : 'No lyrics available';
  const lyricText = (song.lyrics && song.lyrics.trim()) || fallbackLyrics;
  els.lyricsContent.innerHTML = escapeHtml(lyricText).replace(/\n/g, '<br>');
  els.lyricsContent.scrollTop = 0;
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

function setPlaybackButtonState(isPlaying) {
  els.playPauseBtn.innerHTML = iconSvg(isPlaying ? 'pause' : 'play');
}

function getPlaybackList(song) {
  if (!song) return [];
  if (song.source === 'youtube') return state.videos;
  return state.songs;
}

function findCurrentIndex() {
  if (!state.currentSong) return -1;
  const key = String(state.currentSong.id || state.currentSong.videoId || state.currentSong.title);
  const list = getPlaybackList(state.currentSong);
  return list.findIndex((s) => String(s.id || s.videoId || s.title) === key);
}

function playIndex(idx) {
  const list = getPlaybackList(state.currentSong);
  if (idx < 0 || idx >= list.length) return;
  playSong(list[idx]);
}

function nextTrack() {
  if (!state.currentSong) return;
  const list = getPlaybackList(state.currentSong);
  const idx = findCurrentIndex();
  if (idx === -1 || list.length === 0) {
    return;
  }
  const next = idx + 1;
  if (next < list.length) {
    playIndex(next);
  } else {
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
  const key = songKey(song);
  if (state.liked.includes(key)) {
    state.liked = state.liked.filter((item) => item !== key);
  } else {
    state.liked.push(key);
  }
}

function pushHistory(song) {
  if (!song) return;
  const key = songKey(song);
  const existing = state.history.find((item) => songKey(item) === key);
  if (existing) {
    state.history = [existing, ...state.history.filter((item) => songKey(item) !== key)];
  } else {
    state.history = [{ ...song, id: key }, ...state.history];
  }
  state.history = state.history.slice(0, 20);
  renderHistory();
  renderHomeRecommendations();
}

function buildSimilarQuery(song) {
  const title = String(song?.title || '').trim();
  const artist = String(song?.artist || '').trim();
  return [title, artist].filter(Boolean).join(' ');
}

async function fetchLyricsForSong(song) {
  if (!song || !song.videoId || song.source !== 'youtube-music') {
    return;
  }
  const token = `${song.videoId}:${Date.now()}`;
  state.lyricsRequestToken = token;
  try {
    const lyrics = await window.electronAPI.getLyrics(song.videoId, song.source);
    if (state.lyricsRequestToken !== token) return;
    const finalLyrics = String(lyrics || '').trim();
    song.lyrics = finalLyrics || 'No lyrics available';
    if (state.currentSong && songKey(state.currentSong) === songKey(song)) {
      updateDetail(song);
    }
  } catch (error) {
    if (state.lyricsRequestToken !== token) return;
    song.lyrics = 'No lyrics available';
    if (state.currentSong && songKey(state.currentSong) === songKey(song)) {
      updateDetail(song);
    }
  }
}

async function fetchSimilarSongsForSong(song) {
  const query = buildSimilarQuery(song);
  if (!query) {
    state.similarSongs = [];
    renderHomeRecommendations();
    return;
  }
  try {
    const results = await window.electronAPI.searchYouTube(query, 'youtube-music');
    const mapped = (results || []).map((item) => ({
      id: item.videoId || item.id,
      title: item.title,
      artist: item.author || item.artist || 'Unknown artist',
      duration: item.duration || '0:00',
      thumbnail: item.thumbnail || 'https://placehold.co/60x60/1f1f1f/fff?text=♫',
      source: 'youtube-music',
      videoId: item.videoId || item.id,
      lyrics: item.lyrics || '',
    }));
    state.similarSongs = dedupeSongs(mapped, new Set([songKey(song)])).slice(0, 20);
    renderHomeRecommendations();
  } catch (error) {
    state.similarSongs = [];
    renderHomeRecommendations();
  }
}

function playSong(song) {
  if (!song) return;
  state.currentSong = song;
  updateNowPlaying(song);
  updateDetail(song);
  pushHistory(song);
  fetchLyricsForSong(song);
  fetchSimilarSongsForSong(song);

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
        setPlaybackButtonState(true);
      })
      .catch(() => {
        els.nowTitle.textContent = 'Download failed';
      });
  } else {
    els.player.src = toUrl(song.path);
    els.player.volume = state.volume;
    els.player.play();
    state.playing = true;
    setPlaybackButtonState(true);
  }

}

async function performSearch(query) {
  const q = (query || '').trim();
  if (!q) return;

  const targetView = getCurrentSection() === 'videos' ? 'videos' : 'songs';
  const source = getSearchSourceForView(targetView);

  state.currentView = targetView;
  state.activeSource = source;
  setView(targetView);
  els.searchStatus.textContent = 'Searching...';

  try {
    const results = await window.electronAPI.searchYouTube(q, source);
    const mapped = dedupeSongs((results || []).map((item) => ({
      id: item.videoId || item.id,
      title: item.title,
      artist: item.author || item.artist || 'Unknown artist',
      duration: item.duration || '0:00',
      thumbnail: item.thumbnail || 'https://placehold.co/60x60/1f1f1f/fff?text=♫',
      source: source,
      videoId: item.videoId || item.id,
      lyrics: item.lyrics || '',
    })));

    if (targetView === 'videos') {
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

  els.searchBtn.addEventListener('click', () => {
    performSearch(els.searchInput.value);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const activeTag = document.activeElement?.tagName;
    if (activeTag === 'TEXTAREA') return;
    performSearch(els.searchInput.value);
  });

  els.playPauseBtn.addEventListener('click', () => {
    if (!els.player.src) return;
    if (els.player.paused) {
      els.player.play();
      state.playing = true;
      setPlaybackButtonState(true);
    } else {
      els.player.pause();
      state.playing = false;
      setPlaybackButtonState(false);
    }
  });

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
  setView('home');
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
