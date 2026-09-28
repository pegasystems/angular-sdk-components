module.exports = {
  singleQuote: true,
  printWidth: 150,
  trailingComma: 'none',
  arrowParens: 'avoid',
  overrides: [
    {
      files: ['*.html'],
      excludeFiles: ['**/test/**'],
      options: {
        parser: 'angular'
      }
    }
  ]
};
