/* eslint-disable @typescript-eslint/no-var-requires */
const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = function override(config) {
  return {
    ...config,
    plugins: [
      ...config.plugins,
      new MonacoEditorWebpackPlugin({
        languages: ['python', 'markdown'],
      }),
    ],
  };
};
