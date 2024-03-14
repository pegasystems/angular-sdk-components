'use strict';

const fse = require('fs-extra');

const srcDir = './packages/angular-sdk-components/src/sdk-local-component-map.ts';
const destDir = './dist/angular-sdk-components/sdk-local-component-map.ts';

fse.copyFileSync(srcDir, destDir);
