const webpack = require("webpack");
const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  mode: "development",

  entry: {
    main: path.resolve("./src/client/index.ts"),
  },

  output: {
    path: __dirname + "/dist",
    filename: "bundle.js",
  },
  devServer: {
    // host: process.env.IP,
    // https: false,
    // disableHostCheck: true,
    // historyApiFallback: true,
    // port: 8080,
    // allowedHosts: ['all'],
  },

  devtool: "inline-source-map",

  module: {
    rules: [
      { test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader",
        }),
        exclude: /node_modules/,
      },
    ],
  },

  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },

  plugins: [
    new CleanWebpackPlugin(),
    new ExtractTextPlugin("styles.css"),
    new HtmlWebpackPlugin({
      template: path.resolve("./src/client", "index.html"),
    }),
  ],

  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
};
