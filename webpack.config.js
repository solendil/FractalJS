const path = require('path');
const moment = require('moment');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const config = {
  entry: {
    app: './app/js/ui/app.js',
    dev: './app/js/dev/dev.js',
    scheduler: './app/js/scheduler/scheduler.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].entry.js',
  },
  module: {
    rules: [
      { test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/, loader: 'file-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'less-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: [
            ['env', {
              targets: {
                browsers: ['last 2 versions', 'safari >= 7']
              }
            }]
          ],
        }
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    modules: ['app/js', 'node_modules'],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['app'],
      template: './app/html/index.html',
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['scheduler'],
      template: './app/html/scheduler.html',
      filename: 'scheduler.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['dev'],
      template: './app/html/dev.html',
      filename: 'dev.html',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: true,
      },
      BUILD_DATE: JSON.stringify(moment().format('llll')),
    }),
  ]
};


module.exports = config;
