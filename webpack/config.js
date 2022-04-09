const path = require('path');

const config = require(`./${process.env.NODE_ENV}.config`);

module.exports = {
  mode: config.mode,

  entry: './src/main.ts',

  module: {
    rules: [
      {test: /\.(ts)$/, use: 'ts-loader', exclude: /node_modules/},
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 12000,
            },
          },
        ],
      },
    ],
  },

  resolve: {extensions: ['*', '.ts', '.js']},

  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: config.publicPath,
    filename: 'main.js',
    clean: true
  },

  devtool: config.devtool,
  devServer: config.devServer,
};

