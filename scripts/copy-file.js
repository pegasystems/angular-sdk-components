'use strict';

const fs = require('fs');

/**
 * Function which copies file from source directory to destination directory
 * @param {string} sourcePath
 * @param {string} destinationPath
 * @param {string} fileName
 */
function copyFile(sourcePath, destinationPath, fileName) {
  // Copy SECURITY.md file
  const securitySrcDir = `${sourcePath}/${fileName}`;
  const securityDestDir = `${destinationPath}/${fileName}`;

  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }

  fs.copyFileSync(securitySrcDir, securityDestDir);
}

module.exports = copyFile;
