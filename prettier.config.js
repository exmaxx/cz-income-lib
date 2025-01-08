export default {
  trailingComma: 'es5',
  semi: false,
  singleQuote: true,
  printWidth: 120,
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'html',
      },
    },
  ],
}
