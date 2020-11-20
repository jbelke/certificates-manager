const { EventEmitter } = require('events');
const Greenlock = require('greenlock');
const fs = require('fs');
const path = require('path');

const { updateAbtNodeCert } = require('./abtnode');
const pkg = require('../../package.json');

class CertificatesManager extends EventEmitter {
  constructor({ packageRoot, configDir, email, staging = false }) {
    super();
    this.configDir = configDir;
    this.staging = staging;

    this.gl = Greenlock.create({
      packageRoot,
      configDir,
      renew: true,
      staging,
      maintainerEmail: email,
      packageAgent: `${pkg.name}/${pkg.version}`,
      notify: (event, details) => {
        // events list:
        // 1. error
        // 2. warning
        // 3. certificate_order
        // 4. challenge_select
        // 5. challenge_status
        // 6. cert_issue
        if (event === 'error') {
          console.error(details);
          return;
        }

        if (event === 'warning') {
          console.warn(details);
          return;
        }

        if (['challenge_status', 'cert_issue'].includes(event)) {
          console.log('event', event, details);
        } else {
          //  sensitive information
          console.log('event', event);
        }

        if (event === 'cert_issue') {
          this.emit('cert.issued', details);
        }

        if (event === 'cert_renewal') {
          this.emit('cert.renewal', details);
        }
      },
    });
  }

  async addDomain({ subject, altnames }) {
    // TODO: 从 ABT Node api 读取需要生成的证书
    const result = await this.gl.add({
      subject,
      altnames,
    });

    console.log('add domain:', subject, result);
  }

  async renew() {
    return this.gl.renew();
  }

  readCert(subject) {
    const certDir = path.join(this.configDir, this.staging ? 'staging' : 'live', subject);
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

const challengesMap = new Map([
  [
    'alibaba_cloud',
    {
      challenges: {
        'dns-01': ({ accessKeyId, accessKeySecret }) => {
          if (!accessKeyId || !accessKeySecret) {
            throw new Error('accessKeyId and accessKeySecret is required by alibaba_cloud challenge');
          }

          return {
            module: 'acme-dns-01-ali',
            propagationDelay: 10 * 1000,
            accessKeyId,
            accessKeySecret,
          };
        },
      },
    },
  ],
]);

const instances = {};

const email = 'polunzh@qq.com';

const updateCert = async (certificatesManager, subject) => {
  // TODO: 这个地方应该先判断是否需要更新，不过修改为 Node 节点从 blocklet 读取证书信息就不需要了
  const cert = certificatesManager.readCert(subject);
  if (cert) {
    await updateAbtNodeCert(cert);
  }
};

CertificatesManager.getInstance = ({ challengeName, challengeParams = {} }) => {
  if (!challengeName) {
    throw new Error('challengeName param is required');
  }

  if (!challengesMap.has(challengeName)) {
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

  const dns01Challenge = challengesMap.get(challengeName).challenges['dns-01'](challengeParams);

  instance.gl.manager.defaults({
    subscriberEmail: email,
    agreeToTerms: true,
    challenges: { 'dns-01': dns01Challenge },
  });

  instances[challengeName] = instance;
  instance.on('cert.issued', (data) => updateCert(instance, data.subject));
  instance.on('cert.renewal', (data) => updateCert(instance, data.subject));

  return instance;
};

module.exports = CertificatesManager;
