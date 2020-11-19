process.env.ABT_NODE_LOG_DIR = process.env.BLOCKLET_LOG_DIR;
/* eslint-disable arrow-parens */
/* eslint-disable no-console */
require('dotenv').config();
const path = require('path');
const Client = require('@abtnode/client');
require('@greenlock/manager');

const CertificatesManager = require('./libs/certificates-manager');
const { server } = require('./functions/app');
const { abtnodeAccessKey, abtnodeAccessSecret, abtnodePort } = require('./libs/env');

const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment && process.env.ABT_NODE) {
  process.env.BLOCKLET_PORT = 3030;
}

const port = parseInt(process.env.BLOCKLET_PORT, 10) || 3030;

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

const updateCert = async (certificatesManager, subject) => {
  // TODO: 这个地方应该先判断是否需要更新，不过修改为 Node 节点从 blocklet 读取证书信息就不需要了
  const cert = certificatesManager.readCert(subject);
  if (cert) {
    await updateAbtNodeCert(cert);
  }
};

(async () => {
  try {
    const rootDir = process.env.BLOCKLET_DATA_DIR || path.join(__dirname, '..');
    const configDir = path.join(rootDir, './greenlock.d/');
    const certificatesManager = new CertificatesManager({
      packageRoot: rootDir,
      configDir,
      email: 'polunzh@qq.com',
      onIssued: (data) => {
        console.log(data);
        return updateCert(certificatesManager, data.subject);
      },
    });
    await certificatesManager.addDomain({
      subject: 'polunzh.cn',
      altnames: ['polunzh.cn', '*.polunzh.cn'],
    });

    updateCert(certificatesManager, 'polunzh.cn');
  } catch (error) {
    console.error(error);
  }
})();

server.listen(port, (err) => {
  if (err) throw err;
  console.log(`> certificates manager ready on ${port}`);
});
