# Seyn

Seyn is a focused Electron desktop music player for local music, YouTube Music, and YouTube. It keeps the interface deliberately calm and desktop-native while providing playback, caching, lyrics, playlists, likes, history, and lightweight recommendations.

## Development note

Seyn was built as a weekend project. To make a complete working prototype within that limited timeframe, development was assisted by GitHub Copilot and OpenAI Codex. The project owner remains responsible for reviewing, testing, and maintaining the application and its original contributions.

## Features

- Local music-library scanning and playback
- Separate YouTube Music and YouTube search modes
- Audio caching with `yt-dlp`/FFmpeg support
- Play, pause, seek, volume, mute, previous, next, shuffle, and repeat controls
- Auto-replay or context-aware next-track playback
- Synchronized lyrics when the source provides timing information
- Likes shared consistently between song rows, the player, and the Likes view
- First-play history: a song is inserted once in the order it was first played; replaying it does not move it
- User-created playlists with ordering, add/remove actions, and playlist folders
- Local settings and library data stored in the Electron user-data directory

## Requirements

- Node.js 20 or newer
- Python 3
- FFmpeg available on `PATH`
- `yt-dlp` available on `PATH` for the download fallback
- Python package `ytmusicapi` for YouTube Music search and lyrics

The application can still run with reduced functionality when optional media tools or the Python search service are unavailable.

## Clone and run

Replace the placeholder repository URL with the GitHub repository URL you publish:

```bash
git clone https://github.com/AtharvaBarve/seyn.git
cd <YOUR_REPOSITORY>
npm ci

python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

npm start
```

On Windows, use `.venv\\Scripts\\pip.exe` instead of `.venv/bin/pip`.

## Build

Install dependencies and create the distributable with:

```bash
npm ci
npm run build
```

The default Electron Builder target is an AppImage on Linux and an NSIS installer on Windows. Build output is written to `dist/`. The first build may need internet access to obtain the pinned Electron runtime.

## Project layout

```text
main.js                         Electron main process and IPC handlers
preload.js                      Safe renderer API bridge
renderer.js                     UI state, views, playback, history and playlists
index.html                      Application structure
style.css                       Centralized dark/light design system
src/main/services/              Library and YouTube/media services
assets/seyn-logo.png            Seyn sidebar and Linux icon
assets/seyn-logo.ico            Seyn Windows icon
```

## Data and privacy

Seyn does not require an account. Settings, likes, playlists, recommendation signals, and history are stored locally by Electron. Downloaded audio and artwork are cached locally. Do not commit personal library files, cache directories, credentials, `.env` files, or private build artifacts.

The repository intentionally contains no API keys or personal credentials. Before publishing, review `git diff --cached`, `git status --short`, and the files being included in the first commit.

## Credits and licensing

Seyn is an independent application. Its product direction and music-player workflow were informed by the open-source ViTune project:

- ViTune: <https://github.com/bartoostveen/ViTune>

ViTune is credited as inspiration only in this project. Seyn does not claim ownership of ViTune source code, assets, trademarks, or other third-party material. See [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) for the attribution boundary.

Original Seyn source code and project-authored assets are copyright © 2026 Seyn contributors and are reserved under [`LICENSE`](LICENSE). Dependencies remain subject to their respective licenses; their license terms are not transferred to Seyn.

The Seyn logo in `assets/seyn-logo.png` is the project-provided logo asset.

## Contributing

Before opening a pull request, run:

```bash
npm run build
```

Keep changes focused, preserve the existing playback behavior, and do not add credentials or generated cache files. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Security

Please do not publish tokens, cookies, personal media, or user-data files in issues or pull requests. See [`SECURITY.md`](SECURITY.md) for reporting guidance.
