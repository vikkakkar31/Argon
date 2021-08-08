const path = require("path");
const webpack = require("webpack");

const nodeExternals = require("webpack-node-externals");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");

const NodemonPlugin = require("nodemon-webpack-plugin");


const PROD = process.env.NODE_ENV === "production";

module.exports = {
  entry: ["@babel/polyfill", "./src/index.js"],

  target: "node",

  externals: [nodeExternals()],

  output: {
    path: path.resolve(__dirname),
    filename: "server.bundle.js",
  },

  devtool: "inline-module-source-map",

  mode: PROD ? "production" : "development",

  module: {
    rules: [
      {
        test: /\.(js|jsx)/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-proposal-optional-chaining",
          ],
        },
      },
      { test: /\.json$/, loader: "json-loader", type: "javascript/auto" },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(PROD ? "production" : "development"),
    }),
    new webpack.WatchIgnorePlugin([
      path.join(__dirname, "node_modules"),
    ]),
    new NodemonPlugin({
      nodeArgs: ["--inspect"],
    }),
    new SimpleProgressWebpackPlugin(),
  ],
  node: {
    __dirname: false,
  },
};
