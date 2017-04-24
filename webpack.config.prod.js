const path = require('path');
const moment = require('moment');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
  entry: {
    app: './app/js/ui/app.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].entry.js',
  },
  module: {
    rules: [
      { test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/, loader: 'file-loader' },
      { test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader'],
        }),
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: [
            ['env', {
              targets: {
                browsers: ['last 2 chrome versions', 'firefox >= 45', 'last 2 edge versions', 'last 2 safari versions'],
                uglify: true,
              },
              useBuiltIns: true,
            }]
          ],
        }
      }
    ]
  },
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
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        BROWSER: true,
      },
      BUILD_DATE: JSON.stringify(moment().format('llll')),
    }),
    new WebpackShellPlugin({
      onBuildStart: [
        'rm -fr dist',
      ],
      // onBuildEnd: [
      //   './misc/deploy.sh'
      // ],
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false,
      }
    }),
    new ExtractTextPlugin('styles.css'),
  ]
};

module.exports = config;
