require('shelljs/global');

exports.replaceWebpack = () => {
  const replaceTasks = [{
    from: 'webpack/replace/JsonpMainTemplate.runtime.js',
    to: 'node_modules/webpack/lib/JsonpMainTemplate.runtime.js'
  }, {
    from: 'webpack/replace/process-update.js',
    to: 'node_modules/webpack-hot-middleware/process-update.js'
  }];

  replaceTasks.forEach(task => cp(task.from, task.to));
};

exports.copyAssets = (type) => {
  const env = type === 'build' ? 'prod' : type;
  rm('-rf', type);
  mkdir(type);
  cp(`public/extension/manifest.${env}.json`, `${type}/manifest.json`);
  cp('-R', 'public/extension/assets/*', type);
  exec(`pug -O "{ env: '${env}' }" -o ${type} public/extension/views/`);
};
