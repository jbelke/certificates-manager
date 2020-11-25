const { EventEmitter } = require('events');
const path = require('path');
const url = require('url');
const ACME = require('@root/acme');
const Keypairs = require('@root/keypairs');
const CSR = require('@root/csr');
const PEM = require('@root/pem');
const punycode = require('punycode/');
const http01 = require('./http_01').create({});
const accountState = require('../states/account');
const { ensureDir } = require('./util');

const DIRECTORY_URL = 'https://acme-v02.api.letsencrypt.org/directory';
const DIRECTORY_URL_STAGING = 'https://acme-staging-v02.api.letsencrypt.org/directory';

class AcmeWrapper extends EventEmitter {
  constructor({ configDir, maintainerEmail, packageAgent, staging = false }) {
    super();

    this.acme = ACME.create({
      maintainerEmail,
      packageAgent,
      // events list:
      // 1. error
      // 2. warning
      // 3. certificate_order
      // 4. challenge_select
      // 5. challenge_status
      notify: (event, details) => {
        if (event === 'error') {
          console.error('issue with error:', details);
          this.emit('cert.error', { error: details });
          return;
        }

        if (event === 'warning') {
          console.warn('issue with warning', { details });
          this.emit('cert.warning', { details });
          return;
        }

        if (['challenge_status', 'cert_issue'].includes(event)) {
          console.info(`notify ${event} details:`, details);
        }

        this.emit('cert.event:', event);
      },
    });

    this.staging = staging;
    this.directoryUrl = this.staging === true ? DIRECTORY_URL_STAGING : DIRECTORY_URL;
    this.configDir = configDir;
    this.maintainerEmail = maintainerEmail;
    ensureDir(this.configDir);

    this.accountDir = path.join(this.configDir, 'accounts', url.parse(this.directoryUrl).host);
    this.certDir = path.join(this.configDir, this.staging ? 'staging' : 'live');
    ensureDir(this.accountDir);
    ensureDir(this.certDir);

    console.info('directory url:', this.directoryUrl);
  }

  async init() {
    await this.acme.init(this.directoryUrl);
    await this._createAccount();
  }

  async create({ subject, subscriberEmail, agreeToTerms = true }) {
    const domains = [subject].map((name) => punycode.toASCII(name));
    const certDir = path.join(this.certDir, subject);
    ensureDir(certDir);

    const encoding = 'der';
    const typ = 'CERTIFICATE REQUEST';

    const serverKeypair = await Keypairs.generate({ kty: 'RSA', format: 'jwk' });
    const serverKey = serverKeypair.private;
    const serverPem = await Keypairs.export({ jwk: serverKey, encoding: 'pem' });

    const csrDer = await CSR.csr({ jwk: serverKey, domains, encoding });
    const csr = PEM.packBlock({ type: typ, bytes: csrDer });
    console.info(`validating domain authorization for ${domains.join(' ')}`);

    const accountKey = await this._readAccountKey();
    const account = await this.acme.accounts.create({
      subscriberEmail,
      agreeToTerms,
      accountKey,
    });

    try {
      const pems = await this.acme.certificates.create({
        account,
        accountKey,
        csr,
        domains,
        challenges: { 'http-01': http01 },
      });

      const fullchain = `${pems.cert}\n${pems.chain}\n`;

      console.info('certificates generated!');

      this.emit('cert.issued', {
        subject,
        privkey: serverPem,
        cert: pems.cert,
        chain: pems.chain,
        fullchain,
        challenges: { 'http-01': { module: 'http_01' } },
      });
    } catch (error) {
      console.error('create certificate error', { domain: subject, error });
      this.emit('cert.error', { domain: subject, error_message: error.message });
    }
  }

  async _createAccount() {
    const account = await accountState.findOne({ directoryUrl: this.directoryUrl });
    if (account) {
      return account;
    }

    await this.acme.init(this.directoryUrl);

    // TODO: kty 可以是 RSA? 和 EC 有什么区别？
    const accountKeypair = await Keypairs.generate({ kty: 'EC', format: 'jwk' });
    const accountKey = accountKeypair.private;

    await accountState.update(
      { directoryUrl: this.directoryUrl },
      { directoryUrl: this.directoryUrl, private_key: accountKey, maintainer_email: this.maintainerEmail },
      { upsert: true }
    );

    console.info('account was created', { directoryUrl: this.directoryUrl, maintainerEmail: this.maintainerEmail });
    return accountState.findOne({ directoryUrl: this.directoryUrl });
  }

  async _readAccountKey() {
    const account = await accountState.findOne({ directoryUrl: this.directoryUrl });
    if (!account) {
      throw new Error('no account found');
    }

    return account.private_key;
  }
}

module.exports = AcmeWrapper;
