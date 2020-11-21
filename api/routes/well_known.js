const httpChallenge = require('acme-http-01-standalone').create({});

module.exports = {
  init(app) {
    app.get('/.well-known/acme-challenge/:token', async (req, res) => {
      const savedToken = await httpChallenge.get(req.params.token);
      if (!savedToken) {
        return res.status(404).send();
      }

      return res.send(savedToken);
    });
  },
};
