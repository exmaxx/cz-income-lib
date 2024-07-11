module.exports = {
  trailingComma: 'es5',
  semi: false,
  singleQuote: true,
  maxLineLength: 100,
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'html',
      },
    },
  ],
}
