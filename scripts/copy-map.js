'use strict';

const fse = require('fs-extra');
const copySecurityAndLicense = require('./copy-security-license.js');

const srcDir = './packages/angular-sdk-components/src/sdk-local-component-map.ts';
const destDir = './dist/angular-sdk-components/sdk-local-component-map.ts';

fse.copyFileSync(srcDir, destDir);

// Copy Security.md and License files from root to angular-sdk-components package
copySecurityAndLicense('./dist/angular-sdk-components');
