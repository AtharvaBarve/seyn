const defaultState = {
  currentView: 'liked',
  activeSource: 'youtube-music',
  query: '',
  songs: [],
  videos: [],
  queue: [],
  liked: [],
  currentSong: null,
  settings: {
    volume: 0.8,
    musicFolder: '',
  },
};

module.exports = { defaultState };
