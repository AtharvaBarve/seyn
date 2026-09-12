# ViTune

ViTune is an Electron desktop music player with local-library playback, YouTube/YouTube Music search, audio caching, and lyrics lookup.

## Development prerequisites

- Node.js 20+
- FFmpeg on `PATH`
- `yt-dlp` on `PATH` for the download fallback
- Python 3 with `ytmusicapi` installed for YouTube Music search and lyrics

Install JavaScript dependencies with `npm install`, then run `npm start`.

The application stores settings, likes, and first-play history in the Electron user-data directory. History is ordered by first play: a newly played song is added above older entries, while replaying an existing entry does not move it.
