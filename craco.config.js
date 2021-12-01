/* eslint-disable max-len */
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const plugins = [];
if (process.env.NEED_ANALYZE === 'true') plugins.push(new BundleAnalyzerPlugin());

module.exports = {
  webpack: {
    plugins,
    configure: (webpackConfig) => {
      webpackConfig.devtool = false;
      webpackConfig.optimization = {
        splitChunks: {
          chunks: 'async',
          minSize: 40000,
          maxAsyncRequests: 5, // 最大异步请求数
          maxInitialRequests: 4, // 页面初始化最大异步请求数
          automaticNameDelimiter: '~', // 解决命名冲突
          name: true, // true值将会自动根据切割之前的代码块和缓存组键值(key)自动分配命名,否则就需要传入一个String或者function.
          cacheGroups: {
            common: {
              name: 'chunk-common',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|core-js|axios|ahooks|dayjs|github-markdown-css|rehype-react|remark-parse|bn.js|google-protobuf|esprima)[\\/]/,
              priority: 10,
              chunks: 'all',
            },
            mui: {
              name: 'chunk-mui',
              test: /[\\/]node_modules[\\/](mdi-material-ui|@material-ui|@emotion|notistack|styled-components|mui-datatables|react-*)[\\/]/,
              priority: 15,
              chunks: 'all',
            },
            arcblock: {
              name: 'chunk-arcblock',
              test: /[\\/]node_modules[\\/](@arcblock|@abtnode|@ocap|@blocklet|@nedb)[\\/]/,
              priority: 12,
              chunks: 'all',
            },
          },
        },
      };
      return webpackConfig;
    },
  },
  jest: {
    configure: (config) => {
      const setupFile = path.join(__dirname, './tools/jest-setup.js');
      if (Array.isArray(config.setupFiles)) {
        config.setupFiles.push(setupFile);
      } else {
        config.setupFiles = [setupFile];
      }

      return config;
    },
  },
};
