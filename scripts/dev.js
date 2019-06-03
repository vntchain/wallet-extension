// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'dev';
process.env.NODE_ENV = 'dev';

// Ensure environment variables are read.
require('../config/env');

const tasks = require('./tasks');
const createWebpackServer = require('webpack-httpolyglot-server');
const devConfig = require('../config/webpack.config.dev');

tasks.replaceWebpack();
console.log('[Copy assets]');
console.log('-'.repeat(80));
tasks.copyAssets('dev');

console.log('[Webpack Dev]');
console.log('-'.repeat(80));
console.log('If you\'re developing Inject page,');
console.log('please allow `https://localhost:3000` connections in Google Chrome,');
console.log('and load unpacked extensions with `./dev` folder. (see https://developer.extension.com/extensions/getstarted#unpacked)\n');
createWebpackServer(devConfig, {
  host: 'localhost',
  port: 3000
});
