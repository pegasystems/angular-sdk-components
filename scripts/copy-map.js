'use strict';

const fse = require('fs-extra');

const srcDir = './projects/angular-sdk-library/src/sdk-local-component-map.ts';
const destDir = './dist/angular-sdk-library/sdk-local-component-map.ts';

fse.copyFileSync(srcDir, destDir);
