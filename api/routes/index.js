/* eslint-disable no-loop-func */
require('@greenlock/manager');

const CertificatesManager = require('../libs/manager');
const DomainState = require('../states/domain');

const domainState = new DomainState();

const initializeManager = async () => {
  const domains = await domainState.find();

  // eslint-disable-next-line no-restricted-syntax
  for (const domain of domains) {
    // eslint-disable-next-line no-await-in-loop
    await CertificatesManager.getInstance(domain.challenge);
  }
};

module.exports = {
  init(app) {
    initializeManager();

    app.get('/api/domains', async (req, res) => {
      const domains = await domainState.find();

      return res.json(domains);
    });

    app.post('/api/domains', async (req, res) => {
      const { domain, challenge = 'http-01' } = req.body;
      if (!domain || !challenge) {
        return res.status(400).json('invalid request body');
      }

      const saveResult = await domainState.insert({
        domain,
        challenge,
      });

      console.log('add domain', { domain });

      const certificatesManager = await CertificatesManager.getInstance(challenge);

      await certificatesManager.add({
        subject: saveResult.domain,
        altnames: [saveResult.domain],
      });

      return res.json('ok');
    });
  },
};
