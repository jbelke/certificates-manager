const { lookup } = require('dns');
const crypto = require('crypto');
const { promisify } = require('util');
const fs = require('fs');

const getDomainDnsStatus = async (domain) => {
  if (!domain) {
    throw new Error('domain param is required');
  }

  const data = { domain, resolved: false };
  try {
    const address = await promisify(lookup)(domain);
    data.resolved = true;
    data.ip = address;
  } catch (error) {
    console.error('get domain dns status error', 'domain:', domain, error);
  }

  return data;
};

const getDomainsDnsStatus = async (domains) => {
  const tasks = (domains || []).map((domain) => getDomainDnsStatus(domain));

  const result = await Promise.all(tasks);
  return result;
};

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex');

const ensureDir = (dir) => {
  if (fs.existsSync(dir)) {
    return dir;
  }

  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const isEchoDnsDomain = (domain = '', echoDnsDomain) => {
  if (!domain) {
    return false;
  }

  if (!domain.startsWith('*.')) {
    return false;
  }

  return echoDnsDomain === domain.substr(2);
};

const isWildcardDomain = (domain) => (domain || '').includes('*');

module.exports = { getDomainsDnsStatus, md5, ensureDir, isEchoDnsDomain, isWildcardDomain };
