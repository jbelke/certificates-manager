const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { Certificate } = require('@fidm/x509');
const moment = require('moment');

const { updateAbtNodeCert } = require('./abtnode');
const pkg = require('../../package.json');
const http01 = require('./http_01').create();
const AcmeWrapper = require('./acme_wrapper');
const certificateState = require('../states/certificate');
const domainState = require('../states/domain');
const { md5 } = require('./util');
const createQueue = require('./queue');
const { maintainerEmail } = require('./env');
const { DOMAIN_STATUS } = require('./constant');

const AGENT_NAME = 'abtnode';

const RENEWAL_OFFSET_IN_HOUR = 10 * 24; // 10 day

class AcmeFactory extends EventEmitter {
  constructor({ configDir, email, staging = false }) {
    super();

    this.acme = new AcmeWrapper({
      configDir,
      maintainerEmail: email,
      packageAgent: `${AGENT_NAME}/${pkg.version}`,
      staging,
    });

    this.configDir = configDir;
    this.queue = createQueue({
      name: 'create-cert-queue',
      dataDir: this.configDir,
      onJob: async (job) => this._createCert(job),
      options: {
        maxRetries: 0,
        retryDelay: 5000, // retry after 5 seconds
        maxTimeout: 60 * 1000 * 5, // throw timeout error after 5 minutes
        id: (job) => (job ? md5(`${job.domain}-${job.challenge}`) : ''),
      },
    });
  }

  add(domain, challenge = 'http-01') {
    if (!domain) {
      throw new Error('domain is required when add domain');
    }

    this.queue.push({ domain, challenge });
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

  // TODO: polish add domain
  async _createCert({ domain, challenge, force = false }) {
    try {
      if (!domain) {
        throw new Error('domain is required when create certificate');
      }

      const cert = await certificateState.findOne({ domain });
      let domainStatus = DOMAIN_STATUS.creating;

      if (cert) {
        const info = Certificate.fromPEM(cert.fullchain);
        const hours = moment(info.validTo).diff(moment(), 'hours');

        if (force === false && hours > RENEWAL_OFFSET_IN_HOUR) {
          console.info(`no need to renewal ${domain}, the certificate will expires more than ${hours} hours`);
          await domainState.updateStatus(domain, DOMAIN_STATUS.created);
          await updateCert(domain);
          return;
        }

        domainStatus = DOMAIN_STATUS.renewaling;
      }

      await domainState.updateStatus(domain, domainStatus);
      await this.acme.create({
        subject: domain,
        altnames: [domain],
        challenge,
      });
    } catch (error) {
      console.error(`create certificate for ${domain} job failed`, error);
      throw error;
    }
  }
}

const challengeMap = new Map([['http-01', () => ({ 'http-01': http01 })]]);

const instances = {};

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
    email: maintainerEmail,
    staging: typeof process.env.STAGING === 'undefined' ? process.env.NODE_ENV !== 'production' : !!process.env.STAGING,
  });

  await instance.acme.init();

  instances[challengeName] = instance;
  instance.acme.on('cert.issued', async (data) => {
    const { subject, ...certData } = data;
    await certificateState.update({ domain: subject }, { $set: { domain: subject, ...certData } }, { upsert: true });

    await domainState.updateStatus(subject, DOMAIN_STATUS.created);
    await updateCert(subject);
  });

  instance.acme.on('cert.error', async (data) => {
    if (data.domain) {
      await domainState.updateStatus(data.domain, DOMAIN_STATUS.errorr);
    }
  });

  return instance;
};

module.exports = AcmeFactory;
