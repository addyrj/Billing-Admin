// utils/fileCleanup.js
const fs = require('fs');
const path = require('path');

const cleanupFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    if (filePath) {
      const fullPath = path.join(__dirname, '../public', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  });
};

module.exports = { cleanupFiles };