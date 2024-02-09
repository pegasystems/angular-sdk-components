// eslint-disable-next-line strict
const ExternalsManifest = require('./utils/externalsManifest');
const extLibs = require('./packages/test-app/src/ext-libs');

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
