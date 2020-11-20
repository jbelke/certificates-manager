const Client = require('@abtnode/client');
const { abtnodeAccessKey, abtnodeAccessSecret, abtnodePort } = require('./env');

const client = new Client(`http://127.0.0.1:${abtnodePort}/api/gql`.trim());
client.setAuthAccessKey({
  accessKeyId: abtnodeAccessKey,
  accessKeySecret: abtnodeAccessSecret,
});

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

module.exports = { updateAbtNodeCert };
