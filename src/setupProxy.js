const { createProxyMiddleware } = require('http-proxy-middleware');
const env = require('../api/libs/env');

module.exports = (app) => {
  app.use(createProxyMiddleware('/api', { target: env.baseUrl }));
};
