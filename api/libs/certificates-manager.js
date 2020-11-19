const { EventEmitter } = require('events');
const Greenlock = require('greenlock');
const fs = require('fs');
const path = require('path');

const pkg = require('../../package.json');
const { aliAccessKeyId, aliAccessKeySecret } = require('./env');

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

    this.gl.manager.defaults({
      subscriberEmail: email,
      agreeToTerms: false,
      challenges: {
        'dns-01': {
          module: 'acme-dns-01-ali',
          propagationDelay: 10 * 1000,
          accessKeyId: aliAccessKeyId,
          accessKeySecret: aliAccessKeySecret,
        },
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

  async get(subject) {
    return this.gl.get({ servername: subject });
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

let instance = null;

CertificatesManager.getInstance = () => {
  if (instance !== null) {
    return instance;
  }

  const rootDir = process.env.BLOCKLET_DATA_DIR || path.join(__dirname, '..');
  const configDir = path.join(rootDir, './greenlock.d/');
  instance = new CertificatesManager({
    packageRoot: rootDir,
    configDir,
    email: 'polunzh@qq.com',
    staging: process.env.NODE_ENV !== 'production',
  });

  return instance;
};

module.exports = CertificatesManager;
