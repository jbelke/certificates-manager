const domainState = require('../states/domain');

module.exports = {
  init(app) {
    app.get('/api/domains', async (req, res) => {
      const domains = await domainState.find();

      return res.json(domains);
    });

    app.post('/api/domains', async (req, res) => {
      const { domain, dnsService, accessKey, accessSecret } = req.body;
      if (!domain || !accessKey || !dnsService || !accessSecret) {
        return res.status(400).json('invalid request body');
      }

      await domainState.create({ domain, dnsService, accessKey, accessSecret });

      return res.json('ok');
    });
  },
};
