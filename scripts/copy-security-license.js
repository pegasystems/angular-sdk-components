'use strict';

const fse = require('fs-extra');

/**
 * Function which copies security.md and license files from root directory to destination path
 * @param {string} destinationPath
 */
function copySecurityAndLicense(destinationPath) {
  // Copy SECURITY.md file
  const securitySrcDir = './SECURITY.md';
  const securityDestDir = `${destinationPath}/SECURITY.md`;

  fse.copyFileSync(securitySrcDir, securityDestDir);

  // Copy LICENSE file
  const licenseSrcDir = './LICENSE';
  const licenseDestDir = `${destinationPath}/LICENSE`;

  fse.copyFileSync(licenseSrcDir, licenseDestDir);
}

module.exports = copySecurityAndLicense;
