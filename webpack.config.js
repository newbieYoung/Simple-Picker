module.exports = {
  entry: {
    'index.min': './index.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/build',
    library: {
      root: 'SimplePicker',
      commonjs: 'simplepicker',
      amd: 'simplepicker'
    },
    libraryTarget: 'umd'
  },
  devtool: '#source-map',
  watch: true
};