const { appName, apiPrefix } = require('../libs/env');

module.exports = {
  init(app) {
    app.get('/api/env', (req, res) => {
      res.type('js');
      res.send(`window.env = ${JSON.stringify({ apiPrefix, appName }, null, 2)}`);
    });
  },
};
