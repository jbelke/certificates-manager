const { createProxyMiddleware } = require('http-proxy-middleware');
const env = require('../api/libs/env');

module.exports = (app) => {
  app.use(createProxyMiddleware(['/api', '/.well-known', '/__meta__.js'], { target: env.baseUrl }));
};
