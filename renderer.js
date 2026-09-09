'use strict';

const { ipcRenderer } = require('electron');

// --- Services ---
const { PlayerService } = require('./src/renderer/services/player');
const { QueueService } = require('./src/renderer/services/queue);
const { AppState } = require('./src/renderer/state/appState');
const { ErrorHandler } = require('./src/renderer/services/errorHandler');
const { formatTime, formatDuration } = require('./src/renderer/utils/format');

// --- Views ---
const { HomeView } = require('./src/renderer/views/homeView');
const { LibraryView } = require('./src/renderer/views/libraryView');
const { SearchView } = require('./src/renderer/views/searchView');
const { QueueView } = require('./src/renderer/views/queueView');

// --- SongCard ---
const { SongCard } = require('./src/renderer/components/songCard');

// --- Initialization ---
let playerService;
let queueService;
let appState;
let errorHandler;
let currentlyPlayingSongId;

function initRenderer() {
  // Get the audio element from the DOM
  const audioElement = document.getElementById('player');

  // Initialize services
  playerService = new PlayerService(audioElement);
  queueService = new QueueService();
  appState = new AppState({ queueService, playerService });
  errorHandler = new ErrorHandler(document.body);

  // Subscribe to state changes
  const unsub = appState.subscribe((state) => {
    updateUI(state);
  });

  // Expose APIs to IPC renderer
  exposeRendererAPIs();

  // Initialize views
  initViews();

  // Set up keyboard shortcuts
  setupKeyboardShortcuts();

  // Set up IPC event handlers
  setupIPCHandlers();

  // Return the main view
  showView('home');
}

function exposeRendererAPIs() {
  // Song playback control
  window.playSong = (songData) => {
    const normalizedSong = {
      id: songData.id || Date.now().toString(),
      source: songData.source || 'local',
      title: songData.title || 'Unknown Title',
      artist: songData.artist || 'Unknown Artist',
      album: songData.album || '',
      artwork: songData.artwork || '',
      duration: typeof songData.duration === 'number' ? songData.duration : 0,
      filePath: songData.filePath || null,
      videoId: songData.videoId || null,
      youtubeUrl: songData.youtubeUrl || null,
      cachedPath: songData.cachedPath || null,
      isLoading: false,
      isPlaying: false,
      error: null,
    };

    // Show it in the now-playing bar
    const playerBar = document.querySelector('.now-playing-bar');
    if (playerBar) {
      playerBar.style.display = 'flex';
    }

    appState.playSong(normalizedSong).catch((error) => {
      errorHandler.showError(error.message || 'Failed to play song');
    });
  };

  window.playNext = () => {
    appState.playNext();
  };

  window.playPrevious = () => {
    appState.playPrevious();
  };

  window.addToQueue = (song) => {
    appState.addToQueue(song);
  };

  window.clearQueue = () => {
    appState.clearQueue();
  };

  window.toggleMute = () => {
    appState.toggleMute();
  };

  window.seekTo = (time) => {
    appState.seek(time);
  };

  window.onError = (message) => errorHandler.showError(message);
}

function initViews() {
  // Set up main content container
  const mainContent = document.querySelector('.main-content');
  const nowPlayingBar = document.querySelector('.now-playing-bar');

  // Initialize views with event handlers
  const homeView = new HomeView(document.querySelector('.home-view'), {
    onPlay: (song) => {
      window.playSong(song);
    },
    onAddToQueue: (song) => {
      window.addToQueue(song);
    },
    onNavigate: (view) => {
      showView(view);
    },
  });

  const libraryView = new LibraryView(document.querySelector('.library-view'), {
    onPlay: (song) => {
      window.playSong(song);
    },
    onAddToQueue: (song) => {
      window.addToQueue(song);
    },
    onNavigate: (view) => {
      showView(view);
    },
  });

  const searchView = new SearchView(document.querySelector('.search-view'), {
    onSearch: (query, source) => {
      handleSearch(query, source);
    },
    onPlay: (song) => {
      window.playSong(song);
    },
    onAddToQueue: (song) => {
      window.addToQueue(song);
    },
    onNavigate: (view) => {
      showView(view);
    },
  });

  const queueView = new QueueView(document.querySelector('.queue-view'), {
    onRemove: (songId) => {
      appState.removeFromQueue(songId);
    },
    onMove: (from, to) => {
      appState.moveQueueItem(from, to);
    },
    onPlay: (song, index) => {
      window.playSong(song);
    },
    onPlayNext: () => {
      appState.playNext();
    },
    onPlayPrevious: () => {
      appState.playPrevious();
    },
  });

  // Set up view navigation buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      showView(view);
    });
  });

  // Initialize error handler with the main content
  errorHandler.container = document.querySelector('.error-container') || document.body;

  // Return initial state
  return { homeView, libraryView, searchView, queueView };
}

function updateUI(state) {
  const { queue, currentIndex, nowPlaying, isPlaying, currentTime, duration, volume, isMuted, musicFolder, cacheInfo, view, errors } = state;

  // Update persistent now-playing bar
  updateNowPlayingBar(nowPlaying, playerService, isPlaying, currentTime, duration);

  // Update queue list if view is showing
  if (document.querySelector('.queue-view')) {
    document.querySelector('.queue-list-container').innerHTML = '';
    const listContainer = document.querySelector('.queue-list-container');
    const queueListEl = document.createElement('div');
    queueListEl.className = 'queue-list';
    queue.forEach((song, index) => {
      const isCurrent = index === currentIndex;
      const item = document.createElement('div');
      item.className = `queue-item ${isCurrent ? 'current' : ''}`;
      item.dataset.index = index;
      item.dataset.songId = song.id;

      // Play indicator / current song
      const playIndicator = document.createElement('div');
      playIndicator.className = 'queue-play-indicator';
      if (isCurrent) playIndicator.textContent = '▶';
      else {
        const playBtn = document.createElement('button');
        playBtn.className = 'queue-play-btn';
        playBtn.textContent = '▶';
        playBtn.addEventListener('click', () => {
          // Find the song in search results or library
          const songData = { id: song.id, source: song.source, title: song.title, artist: song.artist };
          window.playSong(songData);
        });
        playIndicator.appendChild(playBtn);
      }
      item.appendChild(playIndicator);

      // Artwork
      const artwork = document.createElement('img');
      artwork.className = 'queue-artwork';
      artwork.src = song.artwork || `https://via.placeholder.com/48x48?text=♪`;
      artwork.alt = '';
      artwork.onerror = () => { artwork.src = 'https://via.placeholder.com/48x48?text=♪'; };
      item.appendChild(artwork);

      // Info
      const info = document.createElement('div');
      info.className = 'queue-info';
      info.innerHTML = `
        <div class="queue-title">${escapeHtml(song.title)}</div>
        <div class="queue-artist">${escapeHtml(song.artist)}</div>
        <div class="queue-source">${song.source.charAt(0).toUpperCase() + song.source.slice(1)}</div>
      `;
      item.appendChild(info);

      // Duration
      if (song.duration > 0) {
        const durationEl = document.createElement('div');
        durationEl.className = 'queue-duration';
        durationEl.textContent = formatDuration(song.duration);
        item.appendChild(durationEl);
      }

      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'queue-remove-btn';
      removeBtn.textContent = '✕';
      removeBtn.title = 'Remove from queue';
      removeBtn.addEventListener('click', () => appState.removeFromQueue(song.id));
      item.appendChild(removeBtn);

      listContainer.appendChild(item);
    });
  }

  // Update song cards active state
  // Update error state
  if (errors && errors.length > 0) {
    errors.forEach(err => errorHandler.showError(err.message));
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateNowPlayingBar(song, playerService, isPlaying, currentTime, duration) {
  const playerBar = document.querySelector('.now-playing-bar');
  if (!playerBar) return;

  if (song) {
    playerBar.style.display = 'flex';
    const thumb = song.artwork || 'https://via.placeholder.com/64x64?text=♪';
    const titleEl = document.getElementById('nowTitle');
    const artistEl = document.getElementById('nowArtist');
    const thumbEl = document.getElementById('nowThumb');

    if (titleEl) titleEl.textContent = song.title || '—';
    if (artistEl) artistEl.textContent = song.artist || '—';
    if (thumbEl) thumbEl.src = thumb;

    // Set play/pause button
    const playBtn = document.getElementById('playPauseBtn');
    if (playBtn) {
      if (isPlaying) playBtn.textContent = '❚❚';
      else playBtn.textContent = '▶';
    }
  } else {
    playerBar.style.display = 'none';
  }

  // Update seek/progress
  if (playerService && typeof playerService.currentTime === 'number') {
    const seekBar = document.getElementById('seekBar');
    const seekTime = document.getElementById('seekTime');
    if (seekBar) seekBar.value = playerService.currentTime / Math.max(duration, 1) * 100;
    if (seekTime) seekTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration || 0)}`;
  }
}

function showView(viewName) {
  // Update nav buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Show/hide views
  const views = ['home', 'library', 'search', 'queue'];
  views.forEach((view) => {
    const el = document.querySelector(`.${view}-view`);
    if (el) {
      el.style.display = view === viewName ? 'block' : 'none';
    }
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Space: play/pause (only if not focused on an input)
    if (e.code === 'Space') {
      e.preventDefault();
      const focused = document.activeElement;
      if (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA') return;
      if (window.togglePlay) window.togglePlay();
    }

    // Arrow left: previous
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      if (window.playPrevious) window.playPrevious();
    }

    // Arrow right: next
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (window.playNext) window.playNext();
    }

    // Arrow up: volume up
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      if (window.setVolume) window.setVolume(Math.min(1, playerService.volume + 0.1));
    }

    // Arrow down: volume down
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      if (window.setVolume) window.setVolume(Math.max(0, playerService.volume - 0.1));
    }
  });
}

// Set up IPC event handlers
function setupIPCHandlers() {
  ipcRenderer.on('library:select-folder', (event, folderPath) => {
    if (!folderPath) return;
    appState.setMusicFolder(folderPath);
    appState.setLocalLibrary([]); // Will be populated on next scan
    appState.setView('library');
    showView('library');
  });

  ipcRenderer.on('library:scan-folder', (event, songs) => {
    if (!songs || songs.length === 0) {
      appState.addError('No supported audio files found in selected folder.');
      return;
    }
    appState.setLocalLibrary(songs);
    appState.setView('library');
    showView('library');
  });

  ipcRenderer.on('library:get-folder', (event) => {
    // Could return saved folder
  });

  ipcRenderer.on('youtube:search', (event, query, source) => {
    if (!query || query.trim() === '') return;
    ipcRenderer.send('youtube:search-result', query);
  });

  ipcRenderer.on('youtube:search-result', (event, results) => {
    if (!results || results.length === 0) {
      appState.addError('No search results found.');
      return;
    }
    // Normalize results into Song objects
    const normalized = results.map(video => ({
      id: video.id || video.videoId || `yt:${video.videoId || Date.now()}`,
      source: 'youtube',
      title: video.title || 'Unknown Title',
      artist: video.artist || video.channel || 'Unknown Artist',
      album: video.album || '',
      artwork: video.artwork || video.thumbnail || 'https://via.placeholder.com/150x150?text=♪',
      duration: video.duration || 0,
      filePath: null,
      videoId: video.videoId || null,
      youtubeUrl: video.youtubeUrl || `https://www.youtube.com/watch?v=${video.videoId || ''}`,
      cachedPath: video.cachedPath || null,
      isLoading: false,
      isPlaying: false,
      error: null,
    }));
    appState.setSearchResults(normalized);
    appState.setView('search');
    showView('search');
  });

  ipcRenderer.on('youtube:download', (event, video) => {
    // This returns the cached path
    console.log('[Renderer IPC] Download result:', video);
  });

  ipcRenderer.on('cache:get-info', (event, info) => {
    appState.setCacheInfo(info);
  });

  ipcRenderer.on('cache:clear', (event) => {
    appState.addError('Cache cleared successfully');
  });
}

// Start the renderer when DOM is ready
document.addEventListener('DOMContentLoaded', initRenderer);