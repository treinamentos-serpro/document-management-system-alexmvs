const fs = require('node:fs/promises');
const path = require('node:path');

function createLocalFileRepository(storageDir) {
  function getPath(storageName) {
    if (typeof storageName !== 'string' || path.basename(storageName) !== storageName) {
      return null;
    }
    return path.join(storageDir, storageName);
  }

  return {
    getPath,

    async exists(storageName) {
      const filePath = getPath(storageName);
      if (!filePath) {
        return false;
      }
      try {
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    },

    async remove(storageName) {
      const filePath = getPath(storageName);
      if (!filePath) {
        return;
      }
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    },
  };
}

module.exports = { createLocalFileRepository };