const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { Certificate } = require('@fidm/x509');
const moment = require('moment');

const { updateAbtNodeCert } = require('./abtnode');
const pkg = require('../../package.json');
const AcmeWrapper = require('./acme_wrapper');
const certificateState = require('../states/certificate');
const domainState = require('../states/domain');
const { maintainerEmail: email } = require('./env');
const { DOMAIN_STATUS } = require('./constant');
const createQueue = require('./queue');
const { md5 } = require('./util');

const AGENT_NAME = 'abtnode';

const RENEWAL_OFFSET_IN_HOUR = 10 * 24; // 10 day

class Manager extends EventEmitter {
  constructor({ dataDir, maintainerEmail, staging = false }) {
    super();
    console.info('initialize manager in data dir:', dataDir);
    this.acme = new AcmeWrapper({
      packageAgent: `${AGENT_NAME}/${pkg.version}`,
      staging,
      maintainerEmail,
    });

    this.maintainerEmail = maintainerEmail;
    this.dataDir = dataDir;
    this.queue = createQueue({
      name: 'create-cert-queue',
      dataDir,
      onJob: async (job) => {
        const data = await domainState.findOne({ domain: job.domain });
        if (data) {
          await this._createCert({
            domain: data.domain,
            subscriberEmail: data.subscriberEmail,
            challenge: data.challenge,
          });
        }
      },
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

    this.queue.push({ domain, challenge, subscriberEmail: this.maintainerEmail });
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

  async _createCert({ domain, subscriberEmail, challenge, force = false }) {
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
          await domainState.updateStatus(domain, DOMAIN_STATUS.generated);
          await updateCert(domain);
          return;
        }

        domainStatus = DOMAIN_STATUS.renewaling;
      }

      await domainState.updateStatus(domain, domainStatus);
      await this.acme.create({
        subject: domain,
        subscriberEmail,
        challenge,
      });
    } catch (error) {
      console.error(`create certificate for ${domain} job failed`, error);
      throw error;
    }
  }
}

let instance = null;

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

Manager.getInstance = async () => {
  if (instance) {
    return instance;
  }

  const rootDir = path.join(__dirname, '..');
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir);
  }

  const dataDir = process.env.BLOCKLET_DATA_DIR || path.join(rootDir, '.data');
  instance = new Manager({
    packageRoot: rootDir,
    dataDir,
    maintainerEmail: email,
    staging: typeof process.env.STAGING === 'undefined' ? process.env.NODE_ENV !== 'production' : !!process.env.STAGING,
  });

  await instance.acme.init();

  instance.acme.on('cert.issued', async (data) => {
    const { subject, ...certData } = data;
    await certificateState.update({ domain: subject }, { $set: { domain: subject, ...certData } }, { upsert: true });

    await domainState.updateStatus(subject, DOMAIN_STATUS.generated);
    await updateCert(subject);
  });

  instance.acme.on('cert.error', async (data) => {
    if (data.domain) {
      await domainState.updateStatus(data.domain, DOMAIN_STATUS.error);
    }
  });

  return instance;
};

Manager.initInstance = Manager.getInstance;

const addCreateJob = async () => {
  const domains = await domainState.find({ status: { $in: [DOMAIN_STATUS.added, DOMAIN_STATUS.error] } });

  if (domains.length) {
    const acmeInstance = await Manager.getInstance();
    // 加入前判断是否已存在
    domains.forEach((domain) => acmeInstance.queue.push(domain));
  }
};

Manager.getJobSchedular = () => ({
  name: 'add-create-cert-job',
  time: process.env.NODE_ENV === 'development' ? '0 * * * * *' : '0 */5 * * * *', // every 5 minutes
  fn: addCreateJob,
});

module.exports = Manager;
