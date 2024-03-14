'use strict';

const copyFile = require('./copy-file.js');

// Copy Security.md file from root to angular-sdk-components lib folder
copyFile('.', './dist/angular-sdk-components', 'SECURITY.md');

// Copy LICENSE file from root to angular-sdk-components lib folder
copyFile('.', './dist/angular-sdk-components', 'LICENSE');

// Copy doc folder to angular-sdk-components lib folder
copyFile('./packages/angular-sdk-components/doc', './dist/angular-sdk-components/lib/doc', 'KeyReleaseUpdates.md');
