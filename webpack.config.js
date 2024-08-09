const path = require('path')

const config = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist/bundle'),
    filename: 'cz-income.min.js',
    library: 'CzIncome',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: 'tsconfig.cjs.json',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
}

module.exports = config
