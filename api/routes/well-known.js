const { db } = require('../libs/http-01');

module.exports = {
  init(app) {
    app.get('/.well-known/acme-challenge/:token', async (req, res) => {
      const savedToken = await db[req.params.token];
      if (!savedToken) {
        return res.status(404).send();
      }

      return res.send(savedToken);
    });
  },
};
