const Client = require('@abtnode/client');
require('@greenlock/manager');

const CertificatesManager = require('../libs/certificates-manager');
const { abtnodeAccessKey, abtnodeAccessSecret, abtnodePort } = require('../libs/env');
const domainState = require('../states/domain');

const client = new Client(`http://127.0.0.1:${abtnodePort}/api/gql`.trim());
client.setAuthAccessKey({
  accessKeyId: abtnodeAccessKey,
  accessKeySecret: abtnodeAccessSecret,
});

const certificatesManager = CertificatesManager.getInstance();

const fixCert = (pem) => pem.split('\n').join('|');

const updateAbtNodeCert = async (cert) => {
  try {
    const domain = cert.subject;
    const certificate = cert.chain;
    const privateKey = cert.privkey;

    const result = await client.updateNginxHttpsCert({
      input: {
        domain,
        privateKey: fixCert(privateKey),
        certificate: fixCert(certificate),
      },
    });

    console.log('update cert to ABT Node success:', result);
  } catch (error) {
    console.error('update cert to ABT Node failed:', error);
  }
};

const updateCert = async (subject) => {
  // TODO: 这个地方应该先判断是否需要更新，不过修改为 Node 节点从 blocklet 读取证书信息就不需要了
  const cert = certificatesManager.readCert(subject);
  if (cert) {
    await updateAbtNodeCert(cert);
  }
};

certificatesManager.once('cert.issued', (data) => updateCert(data.subject));
certificatesManager.once('cert.renewal', (data) => updateCert(data.subject));

module.exports = {
  init(app) {
    // updateCert(certificatesManager, 'polunzh.cn');
    domainState
      .find()
      .then((domains) => {
        (domains || []).forEach(({ domain }) => {
          updateCert(domain);
        });
      })
      .catch((error) => {
        console.error('find domains failed', error);
      });

    app.get('/api/domains', async (req, res) => {
      const domains = await domainState.find();

      return res.json(domains);
    });

    app.post('/api/domains', async (req, res) => {
      const { domain, dnsService, accessKey, accessSecret } = req.body;
      if (!domain || !accessKey || !dnsService || !accessSecret) {
        return res.status(400).json('invalid request body');
      }

      const saveResult = await domainState.create({ domain, dnsService, accessKey, accessSecret });
      console.log('add domain', { domain });

      await certificatesManager.addDomain({
        subject: saveResult.domain,
        altnames: [saveResult.domain, `*.${saveResult.domain}`],
      });

      return res.json('ok');
    });
  },
};
