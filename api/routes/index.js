/* eslint-disable no-loop-func */
require('@greenlock/manager');

const CertificatesManager = require('../libs/certificates-manager');
const DomainState = require('../states/domain');
const DnsProviderState = require('../states/dns_provider');

const domainState = new DomainState();
const dnsProviderState = new DnsProviderState();

const initializeManager = async () => {
  const domains = await domainState.find();

  // eslint-disable-next-line no-restricted-syntax
  for (const domain of domains) {
    CertificatesManager.getInstance({
      challengeName: domain.dnsProvider.name,
      challengeParams: domain.dnsProvider.credentials,
    });
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
      const { domain, dnsProvider } = req.body;
      if (!domain || !dnsProvider) {
        return res.status(400).json('invalid request body');
      }

      const provider = await dnsProviderState.findOne({ name: dnsProvider });
      if (!provider) {
        return res.status(400).json(`${dnsProvider} provider does not exist`);
      }

      const saveResult = await domainState.insert({
        domain,
        dnsProvider: { name: provider.name, credentials: provider.credentials },
      });

      console.log('add domain', { domain });

      const certificatesManager = CertificatesManager.getInstance({
        challengeName: dnsProvider,
        challengeParams: {
          accessKeyId: provider.credentials.accessKeyId,
          accessKeySecret: provider.credentials.accessKeySecret,
        },
      });

      await certificatesManager.addDomain({
        subject: saveResult.domain,
        altnames: [saveResult.domain, `*.${saveResult.domain}`],
      });

      return res.json('ok');
    });

    app.post('/api/dns_providers', async (req, res) => {
      const { name, accessKeyId, accessKeySecret } = req.body;
      if (!name || !accessKeyId || !accessKeySecret) {
        return res.status(400).json('invalid request body');
      }

      await dnsProviderState.insert({ name, credentials: { accessKeyId, accessKeySecret } });
      console.log('add dns provider', { name });

      return res.json('ok');
    });

    app.get('/api/dns_providers', async (req, res) => {
      const result = await dnsProviderState.find();

      return res.json(result);
    });
  },
};
