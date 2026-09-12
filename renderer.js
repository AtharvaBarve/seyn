const state = {
  currentView: 'home',
  activeSource: 'youtube-music',
  songs: [],
  videos: [],
  liked: [],
  likedSongs: [],
  history: [],
  similarSongs: [],
  recommendations: [],
  playlists: [],
  selectedPlaylistId: null,
  openPlaylistId: null,
  playCounts: {},
  currentSong: null,
  playing: false,
  playbackList: null,
  autoReplay: false,
  syncLyrics: true,
  theme: 'dark',
  volume: 0.8,
  lyricsRequestToken: null,
  playbackRequestToken: 0,
};

const els = {
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  songsList: document.getElementById('songsList'),
  videosList: document.getElementById('videosList'),
  likedList: document.getElementById('likedList'),
  homeRecommendations: document.getElementById('homeRecommendations'),
  historyList: document.getElementById('historyList'),
  playlistsList: document.getElementById('playlistsList'),
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
  searchPrefix: document.getElementById('searchPrefix'),
  autoReplaySetting: document.getElementById('autoReplaySetting'),
  syncLyricsSetting: document.getElementById('syncLyricsSetting'),
  themeSetting: document.getElementById('themeSetting'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  cacheInfo: document.getElementById('cacheInfo'),
  settingsVolume: document.getElementById('settingsVolume'),
  clearCacheBtn: document.getElementById('clearCacheBtn'),
  refreshLibraryBtn: document.getElementById('refreshLibraryBtn'),
  playlistPickerOverlay: document.getElementById('playlistPickerOverlay'),
  playlistPickerSong: document.getElementById('playlistPickerSong'),
  playlistPickerList: document.getElementById('playlistPickerList'),
  playlistPickerName: document.getElementById('playlistPickerName'),
  closePlaylistPicker: document.getElementById('closePlaylistPicker'),
  cancelPlaylistPicker: document.getElementById('cancelPlaylistPicker'),
  confirmPlaylistPicker: document.getElementById('confirmPlaylistPicker'),
  createAndAddPlaylist: document.getElementById('createAndAddPlaylist'),
};

function formatDuration(value) {
  const seconds = Number(value) || 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function setTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.body.dataset.theme = nextTheme;
  if (els.themeSetting) els.themeSetting.value = nextTheme;
  return nextTheme;
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
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="5.5" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3Zm10-2a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor"/></svg>',
    playlist: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h11M4 11h11M4 16h7M18 14v6m0 0a2 2 0 1 1-2-2 2 2 0 0 1 2 2Zm0 0V7l3-1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.2 2.3 2.5.7 2.2-1.1 1.4 1.4-1.1 2.2.7 2.5L21 12l-2.1 1.1-.7 2.5 1.1 2.2-1.4 1.4-2.2-1.1-2.5.7L12 21l-1.1-2.2-2.5-.7-2.2 1.1-1.4-1.4 1.1-2.2-.7-2.5L3 12l2.2-1.1.7-2.5-1.1-2.2 1.4-1.4 2.2 1.1 2.5-.7L12 3Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    playing: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V10M10 19V5M14 16V8M18 14v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    ,plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3m-9 0 .7 13h8.6L17 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 11 5-5 5 5M12 6v12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 13 5 5 5-5M12 18V6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  return icons[name] || '';
}

function toUrl(value) {
  if (!value) return 'https://placehold.co/60x60/1f1f1f/fff?text=♫';
  if (value.startsWith('http')) return value;
  if (value.startsWith('file://')) return value;
  return `file://${encodeURI(value)}`;
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

function renderSongRow(song, index, targetList, playbackList, options = {}) {
  const row = document.createElement('div');
  const isCurrent = state.currentSong && songKey(state.currentSong) === songKey(song);
  row.className = `song-row${song.source === 'youtube' ? ' video-row' : ''}${isCurrent ? ' is-current' : ''}${options.deleteFromHistory ? ' history-row' : ''}`;
  const isLiked = state.liked.includes(songKey(song));
  row.innerHTML = `
    <div class="song-index">${isCurrent ? iconSvg('playing') : index + 1}</div>
    <img class="song-art" src="${escapeHtml(song.thumbnail || 'https://placehold.co/60x60/1f1f1f/fff?text=♫')}" alt="${escapeHtml(song.title || 'Song artwork')}" />
    <div class="song-main">
      <div class="song-title">${escapeHtml(song.title)}</div>
    </div>
    <div class="song-artist">${escapeHtml(song.artist || 'Unknown artist')}</div>
    <div class="song-duration">${escapeHtml(typeof song.duration === 'string' ? song.duration : formatDuration(song.duration))}</div>
    <button class="song-action ${isLiked ? 'liked' : ''}" data-like="${escapeHtml(String(song.id || song.videoId || song.title))}" aria-label="Like" title="Like">${iconSvg('heart')}</button>
    <button class="song-action" data-add-playlist aria-label="Add to playlist" title="Add to playlist">${iconSvg('plus')}</button>
    ${options.deleteFromHistory ? `<button class="song-action song-delete" data-delete-history aria-label="Delete from history">${iconSvg('trash')}</button>` : ''}
  `;

  row.addEventListener('click', (event) => {
    if (event.target.closest('[data-like], [data-add-playlist], [data-delete-history]')) return;
    playSong(song, playbackList);
  });

  const likeButton = row.querySelector('[data-like]');
  likeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleLike(song);
    if (state.currentSong && songKey(state.currentSong) === songKey(song)) updateNowPlaying(state.currentSong);
    renderAll();
  });

  row.querySelector('[data-add-playlist]').addEventListener('click', (event) => {
    event.stopPropagation();
    openPlaylistPicker(song);
  });
  row.querySelector('[data-delete-history]')?.addEventListener('click', (event) => {
    event.stopPropagation();
    removeHistorySong(song);
  });

  targetList.appendChild(row);
}

function renderList(target, songs, playbackList = songs, options = {}) {
  target.innerHTML = '';
  songs.forEach((song, index) => renderSongRow(song, index, target, playbackList, options));
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
  const availableSongs = [
    ...state.songs,
    ...state.videos,
    ...state.similarSongs,
    ...state.recommendations,
    ...state.likedSongs,
    ...state.history,
    state.currentSong,
    ...state.playlists.flatMap((playlist) => playlist.songs || []),
  ].filter(Boolean);
  const liked = state.liked
    .map((id) => availableSongs.find((song) => songKey(song) === id))
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
  if (state.recommendations.length > 0) {
    return dedupeSongs(state.recommendations, state.currentSong ? new Set([songKey(state.currentSong)]) : undefined).slice(0, 12);
  }
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
  renderList(els.historyList, state.history, state.history, { deleteFromHistory: true });
}

function persistUserData() {
  window.electronAPI.setSettings({
    playlists: state.playlists,
    playCounts: state.playCounts,
  });
}

let pendingPlaylistSong = null;

function addPendingSongToPlaylist(playlist) {
  if (!pendingPlaylistSong || !playlist) return;
  if (!playlist.songs.some((item) => songKey(item) === songKey(pendingPlaylistSong))) {
    playlist.songs.push({ ...pendingPlaylistSong });
  }
  state.selectedPlaylistId = playlist.id;
  state.openPlaylistId = playlist.id;
  persistUserData();
  closePlaylistPicker();
  renderAll();
}

function openPlaylistPicker(song) {
  pendingPlaylistSong = song;
  els.playlistPickerSong.textContent = song?.title ? `Add “${song.title}” to a playlist.` : 'Choose a playlist for this song.';
  els.playlistPickerName.value = '';
  els.confirmPlaylistPicker.disabled = true;
  els.playlistPickerList.innerHTML = state.playlists.length
    ? state.playlists.map((playlist) => `<button class="playlist-picker-option" data-picker-playlist="${escapeHtml(playlist.id)}"><span class="folder-icon">${iconSvg('playlist')}</span><span><strong>${escapeHtml(playlist.name)}</strong><small>${playlist.songs.length} songs</small></span></button>`).join('')
    : '<div class="empty-state">No playlists yet. Create one below.</div>';
  els.playlistPickerList.querySelectorAll('[data-picker-playlist]').forEach((button) => button.addEventListener('click', () => {
    els.playlistPickerList.querySelectorAll('.selected').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    els.confirmPlaylistPicker.disabled = false;
    els.confirmPlaylistPicker.dataset.playlistId = button.dataset.pickerPlaylist;
  }));
  els.playlistPickerOverlay.hidden = false;
  els.playlistPickerName.focus();
}

function closePlaylistPicker() {
  pendingPlaylistSong = null;
  els.playlistPickerOverlay.hidden = true;
  els.confirmPlaylistPicker.dataset.playlistId = '';
}

function createAndAddPlaylist() {
  const name = els.playlistPickerName.value.trim();
  if (!name) return;
  const existing = state.playlists.find((playlist) => playlist.name.toLowerCase() === name.toLowerCase());
  const playlist = existing || { id: `playlist-${Date.now()}`, name, songs: [] };
  if (!existing) state.playlists.push(playlist);
  addPendingSongToPlaylist(playlist);
}

function renderPlaylists() {
  const target = els.playlistsList;
  if (!state.selectedPlaylistId && state.playlists[0]) state.selectedPlaylistId = state.playlists[0].id;
  const selected = state.playlists.find((playlist) => playlist.id === state.openPlaylistId);
  target.innerHTML = `
    <div class="playlist-toolbar">
      <input id="newPlaylistName" type="text" placeholder="New playlist name" />
      <button class="secondary-btn" data-create-playlist>Create playlist</button>
    </div>
    <div class="playlist-items folder-grid">
      ${state.playlists.length ? state.playlists.map((playlist) => `
        <div class="playlist-item playlist-folder ${playlist.id === state.selectedPlaylistId ? 'active' : ''}" data-playlist-folder="${escapeHtml(playlist.id)}">
          <button class="playlist-select" data-playlist-id="${escapeHtml(playlist.id)}" title="Double-click to open playlist">
            <span class="folder-icon">${iconSvg('playlist')}</span><strong>${escapeHtml(playlist.name)}</strong><small>${playlist.songs.length} songs</small>
          </button>
          <button class="playlist-delete" data-delete-playlist="${escapeHtml(playlist.id)}" aria-label="Delete playlist">${iconSvg('trash')}</button>
        </div>
      `).join('') : '<div class="empty-state">Create a playlist to organize your music.</div>'}
    </div>
    ${selected ? `
      <div class="playlist-detail">
        <div class="playlist-detail-heading"><h3>${escapeHtml(selected.name)}</h3><span>${selected.songs.length} songs · double-click another folder to switch</span></div>
        ${selected.songs.length ? selected.songs.map((song, index) => `
          <div class="playlist-song-row">
            <img src="${escapeHtml(song.thumbnail || 'https://placehold.co/48x48/1f1f1f/fff?text=♫')}" alt="" />
            <button class="playlist-song-play" data-playlist-song="${index}"><strong>${escapeHtml(song.title)}</strong><small>${escapeHtml(song.artist || 'Unknown artist')}</small></button>
            <button class="playlist-order" data-playlist-up="${index}" aria-label="Move up">${iconSvg('up')}</button>
            <button class="playlist-order" data-playlist-down="${index}" aria-label="Move down">${iconSvg('down')}</button>
            <button class="playlist-delete" data-remove-playlist-song="${index}" aria-label="Remove song">${iconSvg('trash')}</button>
          </div>
        `).join('') : '<div class="empty-state">Add songs from any song row using the plus button.</div>'}
      </div>
    ` : ''}
  `;
  target.querySelector('[data-create-playlist]')?.addEventListener('click', () => {
    const input = target.querySelector('#newPlaylistName');
    const name = input.value.trim();
    if (!name) return;
    const playlist = { id: `playlist-${Date.now()}`, name, songs: [] };
    state.playlists.push(playlist);
    state.selectedPlaylistId = playlist.id;
    state.openPlaylistId = null;
    persistUserData();
    renderPlaylists();
  });
  target.querySelectorAll('[data-playlist-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedPlaylistId = button.dataset.playlistId;
      target.querySelectorAll('.playlist-folder').forEach((folder) => folder.classList.toggle('active', folder.dataset.playlistFolder === state.selectedPlaylistId));
    });
  });
  target.querySelectorAll('[data-playlist-folder]').forEach((folder) => {
    folder.addEventListener('dblclick', (event) => {
      if (event.target.closest('[data-delete-playlist]')) return;
      state.selectedPlaylistId = folder.dataset.playlistFolder;
      state.openPlaylistId = folder.dataset.playlistFolder;
      renderPlaylists();
    });
  });
  target.querySelectorAll('[data-delete-playlist]').forEach((button) => button.addEventListener('click', () => {
    state.playlists = state.playlists.filter((playlist) => playlist.id !== button.dataset.deletePlaylist);
    state.selectedPlaylistId = state.playlists[0]?.id || null;
    if (state.openPlaylistId === button.dataset.deletePlaylist) state.openPlaylistId = null;
    persistUserData();
    renderPlaylists();
  }));
  target.querySelectorAll('[data-playlist-song]').forEach((button) => button.addEventListener('click', () => {
    playSong(selected.songs[Number(button.dataset.playlistSong)], selected.songs);
  }));
  target.querySelectorAll('[data-playlist-up], [data-playlist-down]').forEach((button) => button.addEventListener('click', () => {
    const index = Number(button.dataset.playlistUp ?? button.dataset.playlistDown);
    const next = button.dataset.playlistUp !== undefined ? index - 1 : index + 1;
    if (next < 0 || next >= selected.songs.length) return;
    [selected.songs[index], selected.songs[next]] = [selected.songs[next], selected.songs[index]];
    persistUserData();
    renderPlaylists();
  }));
  target.querySelectorAll('[data-remove-playlist-song]').forEach((button) => button.addEventListener('click', () => {
    selected.songs.splice(Number(button.dataset.removePlaylistSong), 1);
    persistUserData();
    renderPlaylists();
  }));
}

function removeHistorySong(song) {
  state.history = state.history.filter((item) => songKey(item) !== songKey(song));
  window.electronAPI.setSettings({ history: state.history });
  if (song.videoId) window.electronAPI.deleteCacheFile(song.videoId);
  renderHistory();
  renderHomeRecommendations();
}

function renderAll() {
  renderSongs();
  renderVideos();
  renderLiked();
  renderHistory();
  renderPlaylists();
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

function renderLyrics(song) {
  if (!song) {
    els.lyricsContent.textContent = 'No lyrics available';
    return;
  }
  const fallbackLyrics = song.source === 'youtube-music' ? 'Loading lyrics...' : 'No lyrics available';
  if (state.syncLyrics && Array.isArray(song.lyricsLines) && song.lyricsLines.length > 0) {
    els.lyricsContent.innerHTML = song.lyricsLines.map((line, index) => (
      `<span class="lyric-line" data-lyric-index="${index}">${escapeHtml(line.text)}</span>`
    )).join('');
  } else {
    const lyricText = (song.lyrics && song.lyrics.trim()) || fallbackLyrics;
    els.lyricsContent.innerHTML = escapeHtml(lyricText).replace(/\n/g, '<br>');
  }
  els.lyricsContent.scrollTop = 0;
}

function syncLyricsToPlayback() {
  const song = state.currentSong;
  if (!state.syncLyrics || !song?.lyricsLines?.length) return;
  const current = els.player.currentTime;
  let activeIndex = -1;
  song.lyricsLines.forEach((line, index) => {
    if (current >= Number(line.start || 0) && current < Number(line.end || Infinity)) activeIndex = index;
  });
  els.lyricsContent.querySelectorAll('.lyric-line').forEach((line, index) => {
    line.classList.toggle('active', index === activeIndex);
  });
  const activeLine = els.lyricsContent.querySelector('.lyric-line.active');
  if (activeLine) activeLine.scrollIntoView({ block: 'center', behavior: 'smooth' });
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

  renderLyrics(song);
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
  if (state.playbackList?.length) return state.playbackList;
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
  playSong(list[idx], list);
}

function nextTrack() {
  if (!state.currentSong) return;
  if (state.autoReplay) {
    playSong(state.currentSong, getPlaybackList(state.currentSong));
    return;
  }
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
  const wasLiked = state.liked.includes(key);
  if (wasLiked) {
    state.liked = state.liked.filter((item) => item !== key);
  } else {
    state.liked.push(key);
  }
  if (!wasLiked) {
    state.likedSongs = [...state.likedSongs.filter((item) => songKey(item) !== key), { ...song }];
  } else {
    state.likedSongs = state.likedSongs.filter((item) => songKey(item) !== key);
  }
  window.electronAPI.setSettings({ liked: state.liked, likedSongs: state.likedSongs });
  els.likeBtn.classList.remove('like-pop');
  void els.likeBtn.offsetWidth;
  els.likeBtn.classList.add('like-pop');
  window.setTimeout(() => els.likeBtn.classList.remove('like-pop'), 320);
}

function pushHistory(song) {
  if (!song) return;
  const key = songKey(song);
  // History is a first-play list: replays do not change the established order.
  if (state.history.some((item) => songKey(item) === key)) return;
  state.history = [{ ...song, id: key }, ...state.history];
  window.electronAPI.setSettings({ history: state.history });
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
    const lyricsResult = await window.electronAPI.getLyrics(song.videoId, song.source);
    if (state.lyricsRequestToken !== token) return;
    const result = typeof lyricsResult === 'string' ? { lyrics: lyricsResult, lines: [] } : (lyricsResult || {});
    const finalLyrics = String(result.lyrics || '').trim();
    song.lyrics = finalLyrics || 'No lyrics available';
    song.lyricsLines = Array.isArray(result.lines) ? result.lines : [];
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
    state.recommendations = state.similarSongs;
    renderHomeRecommendations();
  } catch (error) {
    state.similarSongs = [];
    renderHomeRecommendations();
  }
}

function mapRecommendationResults(results) {
  return dedupeSongs((results || []).map((item) => ({
    id: item.videoId || item.id,
    title: item.title,
    artist: item.author || item.artist || 'Unknown artist',
    duration: item.duration || '0:00',
    thumbnail: item.thumbnail || 'https://placehold.co/60x60/1f1f1f/fff?text=♫',
    source: 'youtube-music',
    videoId: item.videoId || item.id,
    lyrics: item.lyrics || '',
  })));
}

async function refreshRecommendations() {
  const profileSongs = [...state.history, ...state.likedSongs, ...state.liked
    .map((id) => [...state.songs, ...state.videos].find((song) => songKey(song) === id))]
    .filter(Boolean);
  const artistScores = profileSongs.reduce((scores, song) => {
    const artist = String(song.artist || '').trim();
    scores[artist] = (scores[artist] || 0) + (state.playCounts[songKey(song)] || 1);
    return scores;
  }, {});
  const profileArtists = Object.keys(artistScores)
    .sort((a, b) => artistScores[b] - artistScores[a])
    .slice(0, 2);
  const starterQueries = ['Hindi hits 2026', 'English pop hits', 'indie music discoveries', 'Bollywood romantic songs', 'K-pop essentials'];
  const explorationQueries = shuffle(starterQueries).slice(0, profileArtists.length ? 1 : 3);
  const queries = profileArtists.length > 0
    ? [`${profileArtists[0]} songs`, `${profileArtists[0]} similar artists`, ...explorationQueries]
    : explorationQueries;
  try {
    const batches = await Promise.all(queries.map((query) => window.electronAPI.searchYouTube(query, 'youtube-music')));
    const excluded = new Set(state.currentSong ? [songKey(state.currentSong)] : []);
    state.recommendations = dedupeSongs(batches.flatMap(mapRecommendationResults), excluded).slice(0, 24);
    renderHomeRecommendations();
  } catch (error) {
    state.recommendations = [];
    renderHomeRecommendations();
  }
}

function playSong(song, playbackList = null) {
  if (!song) return;
  const requestToken = ++state.playbackRequestToken;
  els.player.pause();
  els.player.removeAttribute('src');
  els.player.load();
  state.playing = false;
  setPlaybackButtonState(false);
  els.seekBar.value = 0;
  els.timeCurrent.textContent = '0:00';
  els.timeTotal.textContent = '0:00';
  state.playbackList = playbackList || (song.source === 'youtube' ? state.videos : state.songs);
  state.currentSong = song;
  const key = songKey(song);
  state.playCounts[key] = (state.playCounts[key] || 0) + 1;
  persistUserData();
  updateNowPlaying(song);
  updateDetail(song);
  renderAll();
  pushHistory(song);
  fetchLyricsForSong(song);
  fetchSimilarSongsForSong(song);

  if (song.source === 'youtube' || song.source === 'youtube-music') {
    window.electronAPI.downloadAudio(song)
      .then((filePath) => {
        if (requestToken !== state.playbackRequestToken || state.currentSong !== song) return;
        if (!filePath) {
          els.nowTitle.textContent = 'Download failed';
          return;
        }
        els.player.src = filePath;
        els.player.volume = state.volume;
        return els.player.play().then(() => {
          if (requestToken !== state.playbackRequestToken) return;
          state.playing = true;
          setPlaybackButtonState(true);
        });
      })
      .catch(() => {
        if (requestToken !== state.playbackRequestToken) return;
        els.nowTitle.textContent = 'Download failed';
      });
  } else {
    els.player.src = toUrl(song.path);
    els.player.volume = state.volume;
    els.player.play().then(() => {
      if (requestToken !== state.playbackRequestToken) return;
      state.playing = true;
      setPlaybackButtonState(true);
    }).catch(() => {
      if (requestToken !== state.playbackRequestToken) return;
      els.nowTitle.textContent = 'Playback failed';
    });
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
    const [songResults, videoResults] = await Promise.all([
      window.electronAPI.searchYouTube(q, 'youtube-music'),
      window.electronAPI.searchYouTube(q, 'youtube'),
    ]);
    const mapResults = (results, resultSource) => dedupeSongs((results || []).map((item) => ({
      id: item.videoId || item.id,
      title: item.title,
      artist: item.author || item.artist || 'Unknown artist',
      duration: item.duration || '0:00',
      thumbnail: item.thumbnail || 'https://placehold.co/60x60/1f1f1f/fff?text=♫',
      source: resultSource,
      videoId: item.videoId || item.id,
      lyrics: item.lyrics || '',
    })));
    const mappedSongs = mapResults(songResults, 'youtube-music');
    const mappedVideos = mapResults(videoResults, 'youtube');
    state.songs = mappedSongs;
    state.videos = mappedVideos;

    if (targetView === 'videos') {
      renderVideos();
    } else {
      renderSongs();
    }

    els.searchStatus.textContent = `${mappedSongs.length} songs • ${mappedVideos.length} videos`;
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
  document.querySelectorAll('.nav-icon[data-icon]').forEach((element) => {
    element.innerHTML = iconSvg(element.dataset.icon);
  });
  els.searchPrefix.innerHTML = iconSvg('search');
  els.closePlaylistPicker.addEventListener('click', closePlaylistPicker);
  els.cancelPlaylistPicker.addEventListener('click', closePlaylistPicker);
  els.createAndAddPlaylist.addEventListener('click', createAndAddPlaylist);
  els.confirmPlaylistPicker.addEventListener('click', () => {
    const playlist = state.playlists.find((item) => item.id === els.confirmPlaylistPicker.dataset.playlistId);
    addPendingSongToPlaylist(playlist);
  });
  els.playlistPickerOverlay.addEventListener('click', (event) => {
    if (event.target === els.playlistPickerOverlay) closePlaylistPicker();
  });
  els.playlistPickerName.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') createAndAddPlaylist();
  });
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
    syncLyricsToPlayback();
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
  els.clearHistoryBtn.addEventListener('click', () => {
    state.history = [];
    window.electronAPI.setSettings({ history: [] });
    renderHistory();
    renderHomeRecommendations();
  });
  els.autoReplaySetting.addEventListener('change', () => {
    state.autoReplay = els.autoReplaySetting.checked;
    window.electronAPI.setSettings({ autoReplay: state.autoReplay });
  });
  els.syncLyricsSetting.addEventListener('change', () => {
    state.syncLyrics = els.syncLyricsSetting.checked;
    window.electronAPI.setSettings({ syncLyrics: state.syncLyrics });
    updateDetail(state.currentSong);
  });
  els.themeSetting.addEventListener('change', () => {
    const theme = setTheme(els.themeSetting.value);
    state.theme = theme;
    window.electronAPI.setSettings({ theme });
  });

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
  if (settings) {
    state.theme = settings.theme === 'light' ? 'light' : 'dark';
    setTheme(state.theme);
    const savedVolume = Number(settings.volume);
    state.volume = Number.isFinite(savedVolume) ? savedVolume : 0.8;
    els.volumeBar.value = state.volume;
    els.settingsVolume.value = state.volume;
    els.player.volume = state.volume;
    state.liked = Array.isArray(settings.liked) ? settings.liked : [];
    state.likedSongs = Array.isArray(settings.likedSongs) ? settings.likedSongs : [];
    state.history = Array.isArray(settings.history) ? settings.history : [];
    state.playlists = Array.isArray(settings.playlists)
      ? settings.playlists.filter(Boolean).map((playlist) => ({
        id: String(playlist.id || `playlist-${Date.now()}-${Math.random()}`),
        name: String(playlist.name || 'Untitled playlist'),
        songs: Array.isArray(playlist.songs) ? playlist.songs : [],
      }))
      : [];
    state.playCounts = settings.playCounts && typeof settings.playCounts === 'object' ? settings.playCounts : {};
    state.autoReplay = Boolean(settings.autoReplay);
    state.syncLyrics = settings.syncLyrics !== false;
    els.autoReplaySetting.checked = state.autoReplay;
    els.syncLyricsSetting.checked = state.syncLyrics;
  }
  setTheme(state.theme);
  await loadLocalFolder();
  refreshCacheInfo();
  renderAll();
  refreshRecommendations();
}

bootstrap();
