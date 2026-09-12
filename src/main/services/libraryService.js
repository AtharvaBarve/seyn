const fs = require('fs');
const path = require('path');
const { SUPPORTED_AUDIO_EXTENSIONS } = require('../../shared/constants');

function scanMusicFolder(folderPath) {
  if (!folderPath || !fs.existsSync(folderPath)) return [];

  const result = [];

  function walk(currentPath) {
    let entries;
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch (error) {
      console.warn(`[library] Unable to read ${currentPath}: ${error.message}`);
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_AUDIO_EXTENSIONS.includes(ext)) {
        const title = path.basename(entry.name, ext).replace(/[\[\(].*?[\]\)]/g, '').trim();
        result.push({
          id: fullPath,
          title: title || path.basename(entry.name, ext),
          artist: 'Local file',
          source: 'local',
          path: fullPath,
          thumbnail: '',
          duration: 0,
        });
      }
    }
  }

  walk(folderPath);
  return result;
}

module.exports = { scanMusicFolder };
