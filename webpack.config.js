const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'node',
  entry: {
    'list-books': path.resolve(__dirname, './src/externals/events/api/list-books.ts'),
    'create-book': path.resolve(__dirname, './src/externals/events/api/create-book.ts'),
    'update-book': path.resolve(__dirname, './src/externals/events/api/update-book.ts'),
    'delete-book': path.resolve(__dirname, './src/externals/events/api/delete-book.ts'),
    'detail-book': path.resolve(__dirname, './src/externals/events/api/detail-book.ts'),
  },
  externals: [{
    'aws-sdk': 'commonjs aws-sdk'
  }],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /\.(d|spec)\.ts/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()]
  },
  output: {
    libraryTarget: 'commonjs2',
    filename: '[name]/index.js',
    path: path.resolve(__dirname, 'dist')
  }
}
