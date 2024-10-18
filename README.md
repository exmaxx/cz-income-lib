# Czech Income Calculator

Calculates net and gross income of a person working in the Czech Republic.

Works for:
- freelancer
- employee

## Tests

Run: `yarn test`

## Build

### Library

For publishing to NPM repository.

Compiles TypeScript to JavaScript.

Run: `yarn build:lib`

### Minified Bundle

For importing from a URL in a browser.

Compiles TypeScript to JavaScript and minifies it, using Webpack.

Run: `yarn build:bundle`

## Package Publishing

### Config

Place token config to your `.npmrc` (either local `.npmrc` here in the project
or globally in your home directory):

    //npm.pkg.github.com/:_authToken=YOUR_TOKEN

### Publish

Run: `yarn publish`
