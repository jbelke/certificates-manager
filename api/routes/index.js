/* eslint-disable no-loop-func */
require('@greenlock/manager');
const { parseDomain, ParseResultType } = require('parse-domain');

const Manager = require('../libs/acme-manager');
const { getDomainsDnsStatus, isEchoDnsDomain } = require('../libs/util');
const domainState = require('../states/domain');
const certificateState = require('../states/certificate');
const { maintainerEmail, echoDnsDomain } = require('../libs/env');

module.exports = {
  init(app) {
    Manager.initInstance();

    app.get('/api/domains', async (req, res) => {
      const domains = await domainState.find();
      // eslint-disable-next-line no-restricted-syntax
      for (const domain of domains) {
        // eslint-disable-next-line no-await-in-loop
        const cert = await certificateState.findOne({ domain: domain.domain }, { fullchain: 1 });
        if (cert) {
          domain.certificate = cert;
        }
      }

      return res.json(domains);
    });

    app.post('/api/domains', async (req, res) => {
      const { domain } = req.body;
      if (!domain) {
        return res.status(400).json('invalid request body');
      }

      let challenge = 'http-01';
      if (isEchoDnsDomain(domain, echoDnsDomain)) {
        challenge = 'dns-01';
      } else {
        const parseResult = parseDomain(domain);

        if (parseResult.type !== ParseResultType.Listed) {
          return res.status(400).json('invalid domain');
        }
      }

      const exists = !!(await domainState.findOne({ domain }));
      if (exists) {
        return res.status(400).json(`domain ${domain} already exists`);
      }

      await domainState.insert({
        domain,
        challenge,
        subscriberEmail: maintainerEmail,
      });

      const manager = await Manager.getInstance();
      manager.add(domain);

      console.log('add domain', { domain });

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

    app.post('/api/dns-status', async (req, res) => {
      const { domains } = req.body;

      const result = await getDomainsDnsStatus(domains || []);

      return res.json(result);
    });
  },
};
