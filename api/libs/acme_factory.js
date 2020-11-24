const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { updateAbtNodeCert } = require('./abtnode');
const pkg = require('../../package.json');
const http01 = require('./http_01').create();
const AcmeWrapper = require('./acme_wrapper');
const certificateState = require('../states/certificate');

const AGENT_NAME = 'abtnode';

class AcmeFactory extends EventEmitter {
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
  add(domain) {
    if (!domain) {
      throw new Error('domain is required when add domain');
    }

    return this.acme.add({
      subject: domain,
      altnames: [domain],
    });
  }

  getCertState(domain) {
    const certDir = path.join(this.acme.certDir, domain);
    if (fs.existsSync(certDir)) {
      return true;
    }

    return true;
  }

  readCert(domain) {
    const certDir = path.join(this.acme.certDir, domain);
    if (!fs.existsSync(certDir)) {
      return null;
    }

    const chain = fs.readFileSync(path.join(certDir, 'fullchain.pem')).toString();
    const privkey = fs.readFileSync(path.join(certDir, 'privkey.pem')).toString();

    return {
      domain,
      chain,
      privkey,
    };
  }
}

const challengeMap = new Map([['http-01', () => ({ 'http-01': http01 })]]);

const instances = {};

const email = 'polunzh@qq.com';

const updateCert = async (domain) => {
  if (!domain) {
    throw new Error('domain param is required');
  }

  const cert = await certificateState.findOne({ domain });
  if (!cert) {
    console.warn('no certificate found', { domain });
  }

  await updateAbtNodeCert(cert);
};

AcmeFactory.getInstance = async (challengeName) => {
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
  const instance = new AcmeFactory({
    packageRoot: rootDir,
    configDir,
    email,
    staging: typeof process.env.STAGING === 'undefined' ? process.env.NODE_ENV !== 'production' : !!process.env.STAGING,
  });

  await instance.acme.init();

  instances[challengeName] = instance;
  instance.acme.on('cert.issued', async (data) => {
    const { subject, ...certData } = data;
    await certificateState.update({ domain: subject }, { $set: { domain: subject, ...certData } }, { upsert: true });

    await updateCert(subject);
  });

  return instance;
};

module.exports = AcmeFactory;
