# Seyn

Seyn is a focused Electron desktop music player for local music, YouTube Music, and YouTube. It provides a clean desktop experience with playback, caching, lyrics, playlists, likes, history, and lightweight recommendations.

## Download

Prebuilt releases are available from the [Releases](../../releases) page.

### Linux

Seyn provides two Linux builds:

- **`.deb`** — Recommended for Ubuntu/Debian-based distributions
- **`.AppImage`** — Portable Linux build

#### Debian / Ubuntu

Download the latest `.deb` package from the Releases page and install it with:

```bash
sudo apt install ./seyn-desktop_1.0.0_amd64.deb
```

After installation, Seyn will appear in your application launcher.

#### AppImage

Download the AppImage from the Releases page and make it executable:

```bash
chmod +x Seyn-1.0.0.AppImage
```

Then run:

```bash
./Seyn-1.0.0.AppImage
```

> The `.deb` package is recommended for normal Ubuntu/Debian desktop installation.

### Windows

A Windows NSIS installer is generated through Electron Builder when building on Windows.

---

## Development Note

Seyn was built as a weekend project. To create a complete working prototype within a limited timeframe, development was assisted by GitHub Copilot and OpenAI Codex.

The project owner remains responsible for reviewing, testing, and maintaining the application and its original contributions.

---

## Features

- Local music library scanning and playback
- Separate YouTube Music and YouTube search modes
- Audio caching with `yt-dlp` and FFmpeg
- Play, pause, seek, volume, mute, previous, and next controls
- Shuffle and repeat playback
- Auto-replay and context-aware next-track playback
- Synchronized lyrics when timing information is available
- Likes shared between song rows, the player, and the Likes view
- First-play history
- User-created playlists
- Playlist ordering
- Playlist folders
- Add and remove playlist actions
- Local settings and library data
- Local caching of downloaded audio and artwork
- Lightweight recommendation signals based on local usage

---

## Requirements

### Development

To run Seyn from source, you need:

- Node.js 20 or newer
- Python 3
- FFmpeg available on `PATH`
- `yt-dlp` available on `PATH`
- Python package `ytmusicapi`

### Packaged Releases

The packaged Linux releases include the required Python dependencies for `ytmusicapi`.

Users installing a packaged release do not need to manually create a Python virtual environment or install `ytmusicapi`.

System media tools such as FFmpeg and `yt-dlp` may still be used by the application where applicable.

---

## Clone and Run

Clone the repository:

```bash
git clone git@github.com:AtharvaBarve/seyn.git
cd seyn
```

Install Node.js dependencies:

```bash
npm ci
```

Create a Python virtual environment:

```bash
python3 -m venv .venv
```

Install Python dependencies:

```bash
.venv/bin/pip install -r requirements.txt
```

Start the application:

```bash
npm start
```

### Windows

On Windows, use:

```text
.venv\Scripts\pip.exe
```

instead of:

```text
.venv/bin/pip
```

---

## Build

Seyn uses [Electron Builder](https://www.electron.build/) for packaging.

Install dependencies:

```bash
npm ci
```

Build the application:

```bash
npm run build
```

### Linux

The Linux build produces:

- AppImage
- Debian package (`.deb`)

Build output is written to:

```text
dist/
```

Typical output:

```text
dist/
├── Seyn-1.0.0.AppImage
└── seyn-desktop_1.0.0_amd64.deb
```

The first build may require internet access to download the Electron runtime and packaging tools.

### Windows

When building on Windows, Electron Builder generates the configured NSIS installer.

---

## Linux Installation

### Debian / Ubuntu

Install the Debian package:

```bash
sudo apt install ./dist/seyn-desktop_1.0.0_amd64.deb
```

Launch Seyn from the application menu or with:

```bash
seyn-desktop
```

The Debian package provides desktop integration, including the application launcher entry and Seyn icon.

### AppImage

Make the AppImage executable:

```bash
chmod +x dist/Seyn-1.0.0.AppImage
```

Run it:

```bash
./dist/Seyn-1.0.0.AppImage
```

> On some Linux environments, AppImage execution may encounter Electron/Chromium sandbox restrictions caused by the temporary AppImage mount. The `.deb` package is recommended for normal Linux desktop installation.

---

## Project Layout

```text
main.js                         Electron main process and IPC handlers
preload.js                      Safe renderer API bridge
renderer.js                     UI state, views, playback, history and playlists
index.html                      Application structure
style.css                       Centralized dark/light design system

src/main/services/              Library and YouTube/media services

scripts/                        Python helper scripts
scripts/ytmusic_search.py       YouTube Music search service
scripts/ytmusic_lyrics.py       YouTube Music lyrics service

python-runtime/                 Bundled Python dependencies
runtime-assets/                 Runtime assets used by the packaged application

assets/seyn-logo.png            Seyn logo
assets/seyn-logo.ico            Seyn Windows icon
assets/icons/                   Standard Linux application icon sizes

requirements.txt                Python development dependencies
package.json                    Node.js and Electron configuration
```

---

## Architecture

Seyn is built using Electron.

### Main Process

The Electron main process manages:

- Application lifecycle
- IPC handlers
- Local library operations
- YouTube and YouTube Music services
- Media downloads
- Audio caching
- Lyrics retrieval
- Persistent application data

### Preload

The preload layer provides a controlled API between the renderer and Electron's main process.

This prevents renderer-side code from directly accessing privileged Electron APIs.

### Renderer

The renderer manages:

- Application views
- Search
- Playback controls
- Song lists
- Likes
- History
- Playlists
- Lyrics
- Recommendations
- UI state

### Python Services

Python helper scripts provide YouTube Music functionality through `ytmusicapi`.

For packaged builds, the required Python dependencies are bundled into:

```text
python-runtime/
```

---

## Data and Privacy

Seyn does not require an account.

Application data is stored locally using Electron's user-data directory.

This includes:

- Settings
- Likes
- Playlists
- Recommendation signals
- Playback history

Downloaded audio and artwork are cached locally.

Seyn does not require users to upload their personal music library to a Seyn server.

### Repository Safety

Do not commit:

- Personal music files
- Downloaded audio
- Cache directories
- Authentication credentials
- API keys
- `.env` files
- Personal configuration files
- Private build artifacts

Before committing changes, review:

```bash
git status --short
```

and:

```bash
git diff --cached
```

The repository intentionally contains no API keys or personal credentials.

---

## Credits and Licensing

Seyn is an independent application.

Its product direction and music-player workflow were informed by the open-source [ViTune](https://github.com/bartoostveen/ViTune) project.

ViTune is credited as inspiration only in this project.

Seyn does not claim ownership of ViTune source code, assets, trademarks, or other third-party material.

See [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) for the attribution boundary.

Original Seyn source code and project-authored assets are copyright © 2026 Seyn contributors and are reserved under [`LICENSE`](LICENSE).

Dependencies remain subject to their respective licenses. Their license terms are not transferred to Seyn.

The Seyn logo in `assets/seyn-logo.png` is the project-provided logo asset.

---

## Contributing

Contributions and improvements are welcome.

Before opening a pull request, run:

```bash
npm run build
```

Keep changes focused and preserve the existing playback behavior.

Do not add:

- Credentials
- API keys
- Personal media
- Generated cache files
- Private user data

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution guidelines.

---

## Security

Please do not publish tokens, cookies, credentials, personal media, or user-data files in issues or pull requests.

For security-related issues, see [`SECURITY.md`](SECURITY.md).

---

## License

See [`LICENSE`](LICENSE) for the project's licensing terms.
