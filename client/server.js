/* global __ENVIRONMENT__ */
/* eslint-disable no-console */

require('babel-core/register')({
  plugins: [
    ['transform-require-ignore', {
      extensions: ['.css']
    }]
  ]
});

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const dev = require('webpack-dev-middleware');
const hot = require('webpack-hot-middleware');
const config = require('./webpack.config.js');

const port = process.env.PORT || 3000;

const server = express();

global.__ENVIRONMENT__ = process.env.NODE_ENV || 'development';

// Otherwise errors thrown in Promise routines will be silently swallowed.
process.on('unhandledRejection', (reason, p) => {
  if (reason.stack) {
    console.error(reason.stack);
  } else {
    console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
  }
});

server.get('/favicon.ico', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'image/x-icon' });
  res.end();
});

server.use(express.static(path.resolve(__dirname, 'dist')));

if (__ENVIRONMENT__ === 'development') {
  const compiler = webpack(config);

  server.use(dev(compiler, {
    publicPath: config.output.publicPath,
    stats: {
      hash: false,
      colors: true,
      chunks: false,
      timings: true,
      modules: false,
      chunkModules: false
    }
  }));

  server.use(hot(compiler));
}

server.get('*', require('./app').serverMiddleware);

server.listen(port, (err) => {
  if (err) console.error(err);
  console.info(`⚡⚡⚡ Server running on http://localhost:${port}/`);
});
