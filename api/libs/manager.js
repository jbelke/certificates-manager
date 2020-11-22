const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { updateAbtNodeCert } = require('./abtnode');
const pkg = require('../../package.json');
const http01 = require('./http_01').create();
const AcmeWrapper = require('./acme_wrapper');

const AGENT_NAME = 'abtnode';

class CertificatesManager extends EventEmitter {
  constructor({ configDir, email, staging = false }) {
    super();
    this.acme = new AcmeWrapper({
      configDir,
      maintainerEmail: email,
      packageAgent: `${AGENT_NAME}/${pkg.version}`,
      staging,
    });
  }

  // TODO: polish add domain
  add(...args) {
    this.acme.add(...args);
  }

  readCert(subject) {
    const certDir = path.join(this.acme.certDir, subject);
    if (!fs.existsSync(certDir)) {
      return null;
    }

    const chain = fs.readFileSync(path.join(certDir, 'fullchain.pem')).toString();
    const privkey = fs.readFileSync(path.join(certDir, 'privkey.pem')).toString();

    return {
      subject,
      chain,
      privkey,
    };
  }
}

const challengeMap = new Map([['http-01', () => ({ 'http-01': http01 })]]);

const instances = {};

const email = 'polunzh@qq.com';

const updateCert = async (certificatesManager, subject) => {
  // TODO: 这个地方应该先判断是否需要更新，不过修改为 Node 节点从 blocklet 读取证书信息就不需要了
  const cert = certificatesManager.readCert(subject);
  if (!cert) {
    console.warn('no certificate found', { subject });
  }

  await updateAbtNodeCert(cert);
};

CertificatesManager.getInstance = async (challengeName) => {
  if (!challengeName) {
    throw new Error('challengeName param is required');
  }

  if (!challengeMap.has(challengeName)) {
    throw new Error(`currently ${challengeName} is not support`);
  }

  if (instances[challengeName]) {
    return instances[challengeName];
  }

  const rootDir = process.env.BLOCKLET_DATA_DIR || path.join(__dirname, '..');
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir);
  }

  const configDir = path.join(rootDir, `./${challengeName}.d/`);
  const instance = new CertificatesManager({
    packageRoot: rootDir,
    configDir,
    email,
    staging: process.env.NODE_ENV !== 'production',
  });

  await instance.acme.init();

  instances[challengeName] = instance;
  instance.acme.on('cert.issued', (data) => updateCert(instance, data.subject));

  return instance;
};

module.exports = CertificatesManager;
