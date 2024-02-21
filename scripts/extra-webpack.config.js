// eslint-disable-next-line strict
const ExternalsManifest = require('./externalsManifest');
const extLibs = require('../projects/angular-test-app/src/ext-libs');

// comment this code out, if you have an "ENOENT: no such file or directory" build error and re-build
// to see the real Angular errors, then uncomment onces fixed
module.exports = config => {
  config.plugins.push(
    new ExternalsManifest({
      externals: extLibs.extDefinition
    })
  );
  return config;
};