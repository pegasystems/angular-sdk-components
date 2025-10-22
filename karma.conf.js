// Root Karma configuration with coverage for angular-sdk-components library
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: { clearContext: false },
    reporters: ['progress', 'coverage', 'kjhtml'],
    coverageReporter: {
      dir: require('path').join(__dirname, 'coverage'),
      reporters: [{ type: 'html' }, { type: 'lcovonly' }, { type: 'text-summary' }],
      fixWebpackSourcePaths: true
    },
    browsers: ['ChromeHeadless'],
    singleRun: true,
    restartOnFileChange: false
  });
};
