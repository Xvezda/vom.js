const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'vom.js',
    clean: true,
    library: {
      type: 'umd',
      name: 'Vom',
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward'
            }
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      'NODE_ENV': 'production',
    })
  ]
};
