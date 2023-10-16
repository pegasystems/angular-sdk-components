'use strict';

const fs = require('fs');
const path = require('path');

// overridesPkgDir is path where the files in the package are
const overridesPkgDir = 'packages/angular-sdk-overrides/lib';

// overrideLibDir is the path to where we've previously copied
//  the files in packages/angular-sdk-overrides/lib
const overridesLibDir = path.join(__dirname, '..', overridesPkgDir);

/**
 * modifyImportPath
 *
 * @param {*} match - should be a line starting with import
 * @param {*} importPath - import Path to be updates
 * @returns {string} string that should replace importPath (with @pega/angular-sdk-library)
 */
function modifyImportPath(match, importPath) {
  const modifiedImport = match.replace(importPath, '@pega/angular-sdk-library');
  return modifiedImport;
}

/**
 * processOverrideFile
 *
 * @param {*} filePath absolute path to file being process
 *
 * This function processes the given file which is expected to be a file in the angular-sdk-overrides/lib
 * directory. It finds relative paths of import statements to other components/files in the
 * angular-sdk-library package and updates those relative paths
 * (ex: import FieldValueList from '../../designSystemExtension/FieldValueList';)
 * and updates those to the appropriate @pega/react-sdk-components path
 * (ex: import FieldValueList from '@pega/angular-sdk-library';)
 */
function processOverrideFile(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`, err);
      return;
    }

    // The Regex pattern to match import statements
    const importPattern = /import\s+(?:(?:{[^}]+})|(?:[\w\d*]+))\s+from\s+['"]([^'"]+)['"]/g;

    const newData = data.replace(importPattern, (match, importPath) => {
      if (importPath.includes('../')) {
        return modifyImportPath(match, importPath);
      } else {
        return match;
      }
    });

    // Write the modified content back to the file
    fs.writeFile(filePath, newData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file: ${filePath}`, err);
      }
    });
  });
}

function processOverrideCssFile(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`, err);
      return;
    }

    const importPattern = /@import\s+['"]([^'"]+)['"]/g;
    const newData = data.replace(importPattern, (match, importPath) => {
      if (importPath.includes('../')) {
        const modifiedImport = match.replace(importPath, '@pega/angular-sdk-library/_shared/styles.scss');
        return modifiedImport;
      } else {
        return match;
      }
    });

    // Write the modified content back to the file
    fs.writeFile(filePath, newData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file: ${filePath}`, err);
      }
    });
  });
}

// Function to recursively traverse a directory and process each file
function processSdkOverrides(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processSdkOverrides(filePath);
    } else {
      if (filePath.endsWith('.ts')) {
        processOverrideFile(filePath);
      } else if (filePath.endsWith('.scss')) {
        processOverrideCssFile(filePath);
      }
    }
  }
}

// Start processing the specified folder
processSdkOverrides(overridesLibDir);