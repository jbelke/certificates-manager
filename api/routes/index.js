/* eslint-disable no-loop-func */
require('@greenlock/manager');
const { parseDomain, ParseResultType } = require('parse-domain');

const Manager = require('../libs/manager');
const DomainState = require('../states/domain');

const domainState = new DomainState();

const initializeManager = async () => {
  const domains = await domainState.find();

  // eslint-disable-next-line no-restricted-syntax
  for (const domain of domains) {
    // eslint-disable-next-line no-await-in-loop
    await Manager.getInstance(domain.challenge);
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
      const { domain } = req.body;
      if (!domain) {
        return res.status(400).json('invalid request body');
      }

      const parseResult = parseDomain(domain);

      if (parseResult.type !== ParseResultType.Listed) {
        return res.status(400).json('invalid domain');
      }

      console.log('add domain', { domain });

      const exists = !!(await domainState.findOne({ domain }));
      if (exists) {
        return res.status(400).json(`domain ${domain} already exists`);
      }

      // TODO: ip.abtnet.ip dns-01 兼容
      const challenge = 'http-01';
      await domainState.insert({
        domain,
        challenge,
      });

      console.log('add domain', { domain });

      // const manager = await Manager.getInstance(challenge);

      // manager.add(saveResult.domain);

      return res.json('ok');
    });

    app.delete('/api/domains/:domain', async (req, res) => {
      const { domain } = req.params;
      if (!domain) {
        return res.status(400).json('domain is required');
      }

      const exists = !!(await domainState.findOne({ domain }));
      if (!exists) {
        return res.status(400).json(`domain ${domain} does not exists`);
      }

      const removeResult = await domainState.remove({
        domain,
      });

      console.log('remove result', removeResult);
      return res.json('ok');
    });
  },
};
